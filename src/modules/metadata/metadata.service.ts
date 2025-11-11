import createHttpError from "http-errors";
import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import {
  MetadataCreatePayload,
  MetadataUpdatePayload,
} from "./metadata.schema";

const metadataInclude: Prisma.VehicleInclude = {
  customer: true,
  workOrders: {
    select: {
      id: true,
      code: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      totalCost: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  },
};

const numberFromSearch = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildSearchFilter = (
  term?: string,
): Prisma.VehicleWhereInput | undefined => {
  const normalized = term?.trim();
  if (!normalized) {
    return undefined;
  }

  const conditions: Prisma.VehicleWhereInput[] = [
    { licensePlate: { contains: normalized } },
    { make: { contains: normalized } },
    { model: { contains: normalized } },
    { vin: { contains: normalized } },
    {
      customer: {
        OR: [
          { firstName: { contains: normalized } },
          { lastName: { contains: normalized } },
        ],
      },
    },
  ];

  const yearQuery = numberFromSearch(normalized);
  if (yearQuery !== undefined) {
    conditions.push({ year: yearQuery });
  }

  return {
    OR: conditions,
  };
};

const decimalToNumber = (value: Prisma.Decimal | null | undefined) =>
  value instanceof Prisma.Decimal ? value.toNumber() : Number(value ?? 0);

export const listMetadata = async (search?: string) => {
  const vehicles = await prisma.vehicle.findMany({
    where: buildSearchFilter(search),
    include: metadataInclude,
    orderBy: { updatedAt: "desc" },
    take: search ? 25 : undefined,
  });

  return vehicles.map((vehicle) => {
    const openOrders = vehicle.workOrders.filter(
      (order) => order.status !== "COMPLETED",
    );
    const outstandingBalance = openOrders.reduce(
      (sum, order) => sum + decimalToNumber(order.totalCost),
      0,
    );

    return {
      id: vehicle.id,
      vehicle,
      customer: vehicle.customer,
      recentWorkOrders: vehicle.workOrders,
      stats: {
        totalWorkOrders: vehicle.workOrders.length,
        openWorkOrders: openOrders.length,
        lastServiceDate: vehicle.workOrders[0]?.updatedAt ?? null,
        outstandingBalance,
      },
    };
  });
};

export const getMetadataByVehicleId = async (vehicleId: number) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: metadataInclude,
  });

  if (!vehicle) {
    throw createHttpError(404, `Metadata for vehicle ${vehicleId} not found`);
  }

  return {
    id: vehicle.id,
    vehicle,
    customer: vehicle.customer,
    recentWorkOrders: vehicle.workOrders,
  };
};

export const createMetadata = async (payload: MetadataCreatePayload) => {
  const { customer, vehicle } = payload;

  return prisma.vehicle.create({
    data: {
      ...vehicle,
      customer: {
        create: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          email: customer.email ?? null,
          company: customer.company ?? null,
          notes: customer.notes ?? null,
          addressLine1: customer.addressLine1 ?? null,
          addressLine2: customer.addressLine2 ?? null,
          city: customer.city ?? null,
          state: customer.state ?? null,
          postalCode: customer.postalCode ?? null,
        },
      },
    },
    include: metadataInclude,
  });
};

export const updateMetadata = async (
  vehicleId: number,
  payload: MetadataUpdatePayload,
) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      customer: true,
    },
  });

  if (!vehicle || !vehicle.customer) {
    throw createHttpError(404, `Metadata for vehicle ${vehicleId} not found`);
  }

  return prisma.$transaction(async (tx) => {
    if (payload.customer) {
      await tx.customer.update({
        where: { id: vehicle.customerId },
        data: {
          ...payload.customer,
        },
      });
    }

    if (payload.vehicle) {
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: {
          ...payload.vehicle,
        },
      });
    }

    return tx.vehicle.findUnique({
      where: { id: vehicleId },
      include: metadataInclude,
    });
  });
};

export const deleteMetadata = async (vehicleId: number) => {
  try {
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });
  } catch (error) {
    throw createHttpError(404, `Vehicle ${vehicleId} not found`, {
      cause: error,
    });
  }
};
