import createHttpError from "http-errors";
import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";

const decimal = (value: number) => new Prisma.Decimal(value.toFixed(2));

const generateInventorySku = (name: string) => {
  const normalized = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = Date.now().toString(36).toUpperCase();
  return `INV-${normalized.slice(0, 6) || "ITEM"}-${suffix}`;
};

export const listInventoryItems = async (search?: string) =>
  prisma.inventoryItem.findMany({
    where: search
      ? {
          OR: [{ name: { contains: search } }, { sku: { contains: search } }],
        }
      : undefined,
    orderBy: { name: "asc" },
    take: search ? 25 : undefined,
  });

export const getInventoryItemById = async (id: number) => {
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
  });

  if (!item) {
    throw createHttpError(404, `Inventory item ${id} not found`);
  }
  return item;
};

type InventoryItemInput = {
  name: string;
  sku?: string;
  description?: string | null;
  quantityOnHand?: number;
  reorderPoint?: number;
  unitCost?: number;
  unitPrice?: number;
};

export const createInventoryItem = async (data: InventoryItemInput) =>
  prisma.inventoryItem.create({
    data: {
      name: data.name,
      sku: data.sku?.trim() && data.sku.trim().length > 0
        ? data.sku.trim()
        : generateInventorySku(data.name),
      description:
        data.description && data.description.trim().length > 0
          ? data.description.trim()
          : null,
      quantityOnHand: data.quantityOnHand ?? 0,
      reorderPoint: data.reorderPoint ?? 0,
      unitCost: decimal(data.unitCost ?? 0),
      unitPrice: decimal(data.unitPrice ?? 0),
    },
  });

export const updateInventoryItem = async (
  id: number,
  data: InventoryItemInput,
) => {
  try {
    const updates: Prisma.InventoryItemUpdateInput = {};

    if (data.name !== undefined) {
      updates.name = data.name;
    }

    if ("description" in data) {
      const descriptionValue =
        data.description && data.description.trim().length > 0
          ? data.description.trim()
          : null;
      updates.description = descriptionValue;
    }

    if (data.quantityOnHand !== undefined) {
      updates.quantityOnHand = data.quantityOnHand;
    }

    if (data.reorderPoint !== undefined) {
      updates.reorderPoint = data.reorderPoint;
    }

    if (data.unitCost !== undefined) {
      updates.unitCost = decimal(data.unitCost);
    }

    if (data.unitPrice !== undefined) {
      updates.unitPrice = decimal(data.unitPrice);
    }

    const normalizedSku = data.sku?.trim();
    if (normalizedSku && normalizedSku.length > 0) {
      updates.sku = normalizedSku;
    }

    return await prisma.inventoryItem.update({
      where: { id },
      data: updates,
    });
  } catch (error) {
    throw createHttpError(404, `Inventory item ${id} not found`, {
      cause: error,
    });
  }
};

export const deleteInventoryItem = async (id: number) => {
  try {
    await prisma.inventoryItem.delete({ where: { id } });
  } catch (error) {
    throw createHttpError(404, `Inventory item ${id} not found`, {
      cause: error,
    });
  }
};
