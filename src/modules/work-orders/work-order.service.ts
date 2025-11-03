import { Prisma } from "@prisma/client";
import createHttpError from "http-errors";

import { prisma } from "../../lib/prisma";
import {
  WORK_ORDER_STATUSES,
  WorkOrderAssignmentInput,
  WorkOrderLineItemInput,
  WorkOrderPayload,
} from "./work-order.schema";

type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

type CreateWorkOrderInput = WorkOrderPayload;
type UpdateWorkOrderInput = Partial<WorkOrderPayload>;
type TxClient = Prisma.TransactionClient;

type WorkOrderListFilters = {
  status?: WorkOrderStatus | "ALL";
  from?: Date;
  to?: Date;
  search?: string;
  historical?: boolean;
};

const calculateMoney = (value: number) =>
  new Prisma.Decimal(Number.isFinite(value) ? value.toFixed(2) : "0");
const toDate = (value?: string | null) => (value ? new Date(value) : undefined);

const generateSkuFromName = (name: string) => {
  const compact = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = Date.now().toString(36).toUpperCase();
  return `SKU-${compact.slice(0, 6) || "ITEM"}-${suffix}`;
};

const generateWorkOrderCode = async (tx: TxClient) => {
  const sequence = await tx.workOrder.count();
  return `WO-${(sequence + 1).toString().padStart(5, "0")}`;
};

type InventoryLineInput = Extract<WorkOrderLineItemInput, { type: "PART" }>;
type ServiceLineInput = Extract<WorkOrderLineItemInput, { type: "SERVICE" }>;

const ensureInventoryItem = async (tx: TxClient, input: InventoryLineInput) => {
  if (input.inventoryItemId) {
    const existing = await tx.inventoryItem.findUnique({
      where: { id: input.inventoryItemId },
    });
    if (!existing) {
      throw createHttpError(
        404,
        `Inventory item ${input.inventoryItemId} not found`,
      );
    }

    return { item: existing, created: false };
  }

  const existing = await tx.inventoryItem.findFirst({
    where: {
      name: { equals: input.name },
    },
  });

  if (existing) {
    return { item: existing, created: false };
  }

  const sku = input.sku?.trim()
    ? input.sku.trim()
    : generateSkuFromName(input.name);
  const created = await tx.inventoryItem.create({
    data: {
      name: input.name,
      sku,
      description: input.description ?? null,
      quantityOnHand: input.initialStock ?? input.quantity,
      reorderPoint: 5,
      unitCost: calculateMoney(input.unitPrice),
      unitPrice: calculateMoney(input.unitPrice),
    },
  });

  return { item: created, created: true };
};

const ensureServiceItem = async (tx: TxClient, input: ServiceLineInput) => {
  if (input.serviceItemId) {
    const existing = await tx.serviceItem.findUnique({
      where: { id: input.serviceItemId },
    });
    if (!existing) {
      throw createHttpError(
        404,
        `Service item ${input.serviceItemId} not found`,
      );
    }

    return { item: existing, created: false };
  }

  const existing = await tx.serviceItem.findFirst({
    where: {
      name: { equals: input.name },
    },
  });

  if (existing) {
    return { item: existing, created: false };
  }

  const created = await tx.serviceItem.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      defaultPrice: calculateMoney(input.unitPrice),
    },
  });

  return { item: created, created: true };
};

const applyWorkerDeltas = async (
  tx: TxClient,
  deltas: Map<number, { jobs: number; services: number }>,
) => {
  if (!deltas.size) {
    return;
  }

  await Promise.all(
    Array.from(deltas.entries()).map(([workerId, delta]) =>
      tx.worker.update({
        where: { id: workerId },
        data: {
          totalJobs: { increment: delta.jobs },
          totalServices: { increment: delta.services },
        },
      }),
    ),
  );
};

const prepareAssignments = async (
  tx: TxClient,
  inputs: WorkOrderAssignmentInput[],
  defaultServiceCount: number,
) => {
  if (!inputs.length) {
    return {
      assignmentData:
        [] as Prisma.WorkOrderAssignmentCreateWithoutWorkOrderInput[],
      workerDeltas: new Map<number, { jobs: number; services: number }>(),
    };
  }

  const workerDeltas = new Map<number, { jobs: number; services: number }>();
  const assignmentData: Prisma.WorkOrderAssignmentCreateWithoutWorkOrderInput[] =
    [];

  for (const input of inputs) {
    let workerId: number | null = null;

    if (input.workerId) {
      const existing = await tx.worker.findUnique({
        where: { id: input.workerId },
      });
      if (!existing) {
        throw createHttpError(404, `Worker ${input.workerId} not found`);
      }
      workerId = existing.id;
    } else if (input.workerName) {
      const normalizedName = input.workerName.trim();
      const existing = await tx.worker.findFirst({
        where: {
          name: { equals: normalizedName },
        },
      });

      if (existing) {
        workerId = existing.id;
      } else {
        const created = await tx.worker.create({
          data: {
            name: normalizedName,
          },
        });
        workerId = created.id;
      }
    }

    if (!workerId) {
      throw createHttpError(
        400,
        "workerId or workerName is required to assign a worker",
      );
    }

    const servicesCount = input.servicesCount ?? defaultServiceCount;

    assignmentData.push({
      worker: { connect: { id: workerId } },
      role: input.role ?? null,
      notes: input.notes ?? null,
      servicesCount,
    });

    const current = workerDeltas.get(workerId) ?? { jobs: 0, services: 0 };
    current.jobs += 1;
    current.services += servicesCount;
    workerDeltas.set(workerId, current);
  }

  return { assignmentData, workerDeltas };
};

const prepareLineItems = async (
  tx: TxClient,
  inputs: WorkOrderLineItemInput[],
) => {
  const items: Prisma.WorkOrderLineItemCreateWithoutWorkOrderInput[] = [];
  let partsTotal = 0;
  let servicesTotal = 0;
  let serviceCount = 0;

  for (const input of inputs) {
    if (input.type === "PART") {
      const { item, created } = await ensureInventoryItem(tx, input);
      const lineTotal = input.quantity * input.unitPrice;

      items.push({
        description: input.description ?? item.name,
        quantity: input.quantity,
        unitPrice: calculateMoney(input.unitPrice),
        lineTotal: calculateMoney(lineTotal),
        inventoryItem: { connect: { id: item.id } },
      });

      partsTotal += lineTotal;

      const startingQuantity = created
        ? (input.initialStock ?? input.quantity)
        : item.quantityOnHand;
      const remainingQuantity = startingQuantity - input.quantity;

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          quantityOnHand: remainingQuantity,
          unitPrice: calculateMoney(input.unitPrice),
          description: input.description ?? item.description,
        },
      });
    } else {
      const { item, created } = await ensureServiceItem(tx, input);
      const lineTotal = input.quantity * input.unitPrice;

      items.push({
        description: input.description ?? item.name,
        quantity: input.quantity,
        unitPrice: calculateMoney(input.unitPrice),
        lineTotal: calculateMoney(lineTotal),
        serviceItem: { connect: { id: item.id } },
      });

      servicesTotal += lineTotal;
      serviceCount += input.quantity;

      if (!created) {
        const updates: Prisma.ServiceItemUpdateInput = {};

        if (input.description && input.description !== item.description) {
          updates.description = input.description;
        }

        if (item.defaultPrice.toNumber() !== input.unitPrice) {
          updates.defaultPrice = calculateMoney(input.unitPrice);
        }

        if (Object.keys(updates).length > 0) {
          await tx.serviceItem.update({
            where: { id: item.id },
            data: updates,
          });
        }
      }
    }
  }

  return { items, partsTotal, servicesTotal, serviceCount };
};

export const listWorkOrders = async (filters?: WorkOrderListFilters) =>
  prisma.workOrder.findMany({
    where: {
      status:
        filters?.status && filters.status !== "ALL"
          ? filters.status
          : undefined,
      isHistorical:
        typeof filters?.historical === "boolean"
          ? filters.historical
          : undefined,
      createdAt:
        filters?.from || filters?.to
          ? {
              gte: filters.from,
              lte: filters.to,
            }
          : undefined,
      OR: filters?.search
        ? [
            {
              code: {
                contains: filters.search,
              },
            },
            {
              description: {
                contains: filters.search,
              },
            },
            {
              customer: {
                OR: [
                  {
                    firstName: {
                      contains: filters.search,
                    },
                  },
                  {
                    lastName: {
                      contains: filters.search,
                    },
                  },
                ],
              },
            },
            {
              vehicle: {
                OR: [
                  {
                    vin: {
                      contains: filters.search,
                    },
                  },
                  {
                    make: {
                      contains: filters.search,
                    },
                  },
                  {
                    model: {
                      contains: filters.search,
                    },
                  },
                  {
                    licensePlate: {
                      contains: filters.search,
                    },
                  },
                ],
              },
            },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      vehicle: true,
      lineItems: {
        include: {
          inventoryItem: true,
          serviceItem: true,
        },
      },
      assignments: {
        include: {
          worker: true,
        },
      },
    },
  });

export const getWorkOrderById = async (id: number) => {
  const workOrder = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      lineItems: {
        include: {
          inventoryItem: true,
          serviceItem: true,
        },
      },
      logs: {
        orderBy: { timestamp: "desc" },
      },
      assignments: {
        include: {
          worker: true,
        },
      },
    },
  });

  if (!workOrder) {
    throw createHttpError(404, `Work order ${id} not found`);
  }

  return workOrder;
};

export const createWorkOrder = async (payload: CreateWorkOrderInput) => {
  return prisma.$transaction(async (tx) => {
    const code = await generateWorkOrderCode(tx);
    const lineItemInputs = payload.lineItems ?? [];
    const { items, partsTotal, servicesTotal, serviceCount } =
      await prepareLineItems(tx, lineItemInputs);
    const { assignmentData, workerDeltas } = await prepareAssignments(
      tx,
      payload.assignments ?? [],
      serviceCount,
    );

    const laborCostValue = payload.laborCost ?? servicesTotal;
    const partsCostValue = payload.partsCost ?? partsTotal;
    const taxesValue = payload.taxes ?? 0;
    const discountValue = payload.discount ?? 0;
    const parkingChargeValue = payload.parkingCharge ?? 0;
    const totalValue =
      laborCostValue +
      partsCostValue +
      taxesValue +
      parkingChargeValue -
      discountValue;

    const workOrder = await tx.workOrder.create({
      data: {
        code,
        vehicle: { connect: { id: payload.vehicleId } },
        customer: payload.customerId
          ? { connect: { id: payload.customerId } }
          : undefined,
        description: payload.description,
        status: payload.status ?? "IN_PROGRESS",
        arrivalDate: toDate(payload.arrivalDate) ?? new Date(),
        quotedAt: toDate(payload.quotedAt),
        scheduledDate: toDate(payload.scheduledDate),
        completedDate: toDate(payload.completedDate),
        isHistorical:
          (payload.mode === "HISTORICAL" || payload.isHistorical) ?? false,
        parkingCharge: calculateMoney(parkingChargeValue),
        laborCost: calculateMoney(laborCostValue),
        partsCost: calculateMoney(partsCostValue),
        taxes: calculateMoney(taxesValue),
        discount: calculateMoney(discountValue),
        totalCost: calculateMoney(totalValue),
        notes: payload.notes ?? null,
        lineItems: items.length
          ? {
              create: items,
            }
          : undefined,
        assignments: assignmentData.length
          ? {
              create: assignmentData,
            }
          : undefined,
        logs: {
          create: {
            message: "Work order created",
            author: "system",
            category: "SYSTEM",
          },
        },
      },
      include: {
        customer: true,
        vehicle: true,
        lineItems: {
          include: {
            inventoryItem: true,
            serviceItem: true,
          },
        },
        assignments: {
          include: {
            worker: true,
          },
        },
        logs: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    if (payload.mode === "HISTORICAL" && payload.createdAtOverride) {
      await tx.workOrder.update({
        where: { id: workOrder.id },
        data: {
          createdAt: toDate(payload.createdAtOverride) ?? workOrder.createdAt,
          isHistorical: true,
        },
      });
    }

    await applyWorkerDeltas(tx, workerDeltas);

    return workOrder;
  });
};

export const updateWorkOrder = async (
  id: number,
  payload: UpdateWorkOrderInput,
) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.workOrder.findUnique({
      where: { id },
      include: {
        lineItems: true,
        assignments: true,
      },
    });

    if (!existing) {
      throw createHttpError(404, `Work order ${id} not found`);
    }

    let partsTotal = existing.partsCost.toNumber();
    let servicesTotal = existing.laborCost.toNumber();
    let serviceCount = existing.lineItems.reduce(
      (acc, item) => acc + (item.serviceItemId ? item.quantity : 0),
      0,
    );
    let lineItemCreateData:
      | Prisma.WorkOrderLineItemCreateWithoutWorkOrderInput[]
      | undefined;

    if (payload.lineItems) {
      for (const item of existing.lineItems) {
        if (item.inventoryItemId) {
          await tx.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: {
              quantityOnHand: { increment: item.quantity },
            },
          });
        }
      }

      await tx.workOrderLineItem.deleteMany({ where: { workOrderId: id } });

      const prepared = await prepareLineItems(tx, payload.lineItems);
      lineItemCreateData = prepared.items;
      partsTotal = prepared.partsTotal;
      servicesTotal = prepared.servicesTotal;
      serviceCount = prepared.serviceCount;
    }

    const workerDeltaMap = new Map<
      number,
      { jobs: number; services: number }
    >();
    let assignmentCreateData:
      | Prisma.WorkOrderAssignmentCreateWithoutWorkOrderInput[]
      | undefined;

    if (payload.assignments) {
      for (const assignment of existing.assignments) {
        const current = workerDeltaMap.get(assignment.workerId) ?? {
          jobs: 0,
          services: 0,
        };
        current.jobs -= 1;
        current.services -= assignment.servicesCount;
        workerDeltaMap.set(assignment.workerId, current);
      }

      await tx.workOrderAssignment.deleteMany({ where: { workOrderId: id } });

      const preparedAssignments = await prepareAssignments(
        tx,
        payload.assignments,
        serviceCount,
      );
      assignmentCreateData = preparedAssignments.assignmentData;
      for (const [
        workerId,
        delta,
      ] of preparedAssignments.workerDeltas.entries()) {
        const current = workerDeltaMap.get(workerId) ?? {
          jobs: 0,
          services: 0,
        };
        current.jobs += delta.jobs;
        current.services += delta.services;
        workerDeltaMap.set(workerId, current);
      }
    }

    const laborCostValue = payload.laborCost ?? servicesTotal;
    const partsCostValue = payload.partsCost ?? partsTotal;
    const taxesValue = payload.taxes ?? existing.taxes.toNumber();
    const discountValue = payload.discount ?? existing.discount.toNumber();
    const parkingChargeValue =
      payload.parkingCharge ?? existing.parkingCharge.toNumber();
    const totalValue =
      laborCostValue +
      partsCostValue +
      taxesValue +
      parkingChargeValue -
      discountValue;

    const isHistorical =
      payload.mode !== undefined
        ? payload.mode === "HISTORICAL"
        : payload.isHistorical !== undefined
          ? payload.isHistorical
          : existing.isHistorical;

    const workOrder = await tx.workOrder.update({
      where: { id },
      data: {
        description: payload.description ?? existing.description,
        status:
          (payload.status as WorkOrderStatus | undefined) ?? existing.status,
        arrivalDate: payload.arrivalDate
          ? (toDate(payload.arrivalDate) ?? existing.arrivalDate)
          : existing.arrivalDate,
        quotedAt: payload.quotedAt
          ? (toDate(payload.quotedAt) ?? existing.quotedAt)
          : existing.quotedAt,
        scheduledDate: payload.scheduledDate
          ? toDate(payload.scheduledDate)
          : (existing.scheduledDate ?? undefined),
        completedDate: payload.completedDate
          ? toDate(payload.completedDate)
          : (existing.completedDate ?? undefined),
        isHistorical,
        parkingCharge: calculateMoney(parkingChargeValue),
        laborCost: calculateMoney(laborCostValue),
        partsCost: calculateMoney(partsCostValue),
        taxes: calculateMoney(taxesValue),
        discount: calculateMoney(discountValue),
        totalCost: calculateMoney(totalValue),
        notes: payload.notes ?? existing.notes,
        vehicle: payload.vehicleId
          ? { connect: { id: payload.vehicleId } }
          : undefined,
        customer: payload.customerId
          ? { connect: { id: payload.customerId } }
          : payload.customerId === null
            ? { disconnect: true }
            : undefined,
        lineItems:
          payload.lineItems && lineItemCreateData && lineItemCreateData.length
            ? {
                create: lineItemCreateData,
              }
            : undefined,
        assignments:
          payload.assignments &&
          assignmentCreateData &&
          assignmentCreateData.length
            ? {
                create: assignmentCreateData,
              }
            : undefined,
        logs: {
          create: {
            message: `Work order updated (${(payload.status as WorkOrderStatus | undefined) ?? existing.status})`,
            author: "system",
            category: "SYSTEM",
          },
        },
        createdAt: payload.createdAtOverride
          ? (toDate(payload.createdAtOverride) ?? existing.createdAt)
          : undefined,
      },
      include: {
        customer: true,
        vehicle: true,
        lineItems: {
          include: {
            inventoryItem: true,
            serviceItem: true,
          },
        },
        assignments: {
          include: {
            worker: true,
          },
        },
        logs: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    await applyWorkerDeltas(tx, workerDeltaMap);

    return workOrder;
  });
};

export const completeWorkOrder = async (id: number) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.workOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        lineItems: {
          include: {
            inventoryItem: true,
            serviceItem: true,
          },
        },
        assignments: {
          include: {
            worker: true,
          },
        },
        logs: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    if (!existing) {
      throw createHttpError(404, `Work order ${id} not found`);
    }

    if (existing.status === "COMPLETED" && existing.isHistorical) {
      return existing;
    }

    const completedDate = existing.completedDate ?? new Date();

    const updated = await tx.workOrder.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedDate,
        isHistorical: true,
        logs: {
          create: {
            message: "Work order marked as completed",
            author: "system",
            category: "SYSTEM",
          },
        },
      },
      include: {
        customer: true,
        vehicle: true,
        lineItems: {
          include: {
            inventoryItem: true,
            serviceItem: true,
          },
        },
        assignments: {
          include: {
            worker: true,
          },
        },
        logs: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    return updated;
  });
};

export const deleteWorkOrder = async (id: number) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.workOrder.findUnique({
      where: { id },
      include: {
        lineItems: true,
        assignments: true,
      },
    });

    if (!existing) {
      throw createHttpError(404, `Work order ${id} not found`);
    }

    for (const item of existing.lineItems) {
      if (item.inventoryItemId) {
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            quantityOnHand: { increment: item.quantity },
          },
        });
      }
    }

    const workerDeltaMap = new Map<
      number,
      { jobs: number; services: number }
    >();
    for (const assignment of existing.assignments) {
      const current = workerDeltaMap.get(assignment.workerId) ?? {
        jobs: 0,
        services: 0,
      };
      current.jobs -= 1;
      current.services -= assignment.servicesCount;
      workerDeltaMap.set(assignment.workerId, current);
    }

    await tx.workOrderLog.deleteMany({ where: { workOrderId: id } });
    await tx.workOrderAssignment.deleteMany({ where: { workOrderId: id } });
    await tx.workOrderLineItem.deleteMany({ where: { workOrderId: id } });
    await tx.workOrder.delete({ where: { id } });

    await applyWorkerDeltas(tx, workerDeltaMap);
  });
};
