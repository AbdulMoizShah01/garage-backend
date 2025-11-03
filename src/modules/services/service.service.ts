import createHttpError from "http-errors";
import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";

const decimal = (value: number) => new Prisma.Decimal(value.toFixed(2));

export const listServiceItems = async (search?: string) =>
  prisma.serviceItem.findMany({
    where: search
      ? {
          name: {
            contains: search,
          },
        }
      : undefined,
    orderBy: { name: "asc" },
    take: search ? 25 : undefined,
  });

export const getServiceItemById = async (id: number) => {
  const item = await prisma.serviceItem.findUnique({
    where: { id },
  });

  if (!item) {
    throw createHttpError(404, `Service item ${id} not found`);
  }

  return item;
};

type ServiceItemInput = {
  name: string;
  description?: string | null;
  defaultPrice: number;
};

export const createServiceItem = async (input: ServiceItemInput) => {
  try {
    return await prisma.serviceItem.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        defaultPrice: decimal(input.defaultPrice),
      },
    });
  } catch (error) {
    throw createHttpError(409, `Service "${input.name}" already exists`, {
      cause: error,
    });
  }
};

export const updateServiceItem = async (
  id: number,
  input: Partial<ServiceItemInput>,
) => {
  try {
    return await prisma.serviceItem.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        defaultPrice:
          input.defaultPrice !== undefined
            ? decimal(input.defaultPrice)
            : undefined,
      },
    });
  } catch (error) {
    throw createHttpError(404, `Service item ${id} not found`, {
      cause: error,
    });
  }
};

export const deleteServiceItem = async (id: number) => {
  try {
    await prisma.serviceItem.delete({ where: { id } });
  } catch (error) {
    throw createHttpError(404, `Service item ${id} not found`, {
      cause: error,
    });
  }
};
