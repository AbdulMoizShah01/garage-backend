import createHttpError from "http-errors";

import { prisma } from "../../lib/prisma";

export const listVehicles = async () =>
  prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      workOrders: {
        select: {
          id: true,
          code: true,
          status: true,
          totalCost: true,
        },
      },
    },
  });

export const getVehicleById = async (id: number) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      customer: true,
      workOrders: {
        include: {
          lineItems: true,
        },
      },
    },
  });

  if (!vehicle) {
    throw createHttpError(404, `Vehicle ${id} not found`);
  }

  return vehicle;
};

export const createVehicle = (
  data: Parameters<typeof prisma.vehicle.create>[0]["data"],
) =>
  prisma.vehicle.create({
    data,
  });

export const updateVehicle = async (
  id: number,
  data: Parameters<typeof prisma.vehicle.update>[0]["data"],
) => {
  try {
    return await prisma.vehicle.update({
      where: { id },
      data,
    });
  } catch (error) {
    throw createHttpError(404, `Vehicle ${id} not found`, { cause: error });
  }
};

export const deleteVehicle = async (id: number) => {
  try {
    await prisma.vehicle.delete({
      where: { id },
    });
  } catch (error) {
    throw createHttpError(404, `Vehicle ${id} not found`, { cause: error });
  }
};
