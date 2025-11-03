import createHttpError from "http-errors";

import { prisma } from "../../lib/prisma";

export const listCustomers = async () =>
  prisma.customer.findMany({
    orderBy: { lastName: "asc" },
    include: {
      vehicles: true,
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

export const getCustomerById = async (id: number) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      vehicles: true,
      workOrders: true,
    },
  });

  if (!customer) {
    throw createHttpError(404, `Customer ${id} not found`);
  }

  return customer;
};

export const createCustomer = (
  data: Parameters<typeof prisma.customer.create>[0]["data"],
) =>
  prisma.customer.create({
    data,
  });

export const updateCustomer = async (
  id: number,
  data: Parameters<typeof prisma.customer.update>[0]["data"],
) => {
  try {
    return await prisma.customer.update({
      where: { id },
      data,
    });
  } catch (error) {
    throw createHttpError(404, `Customer ${id} not found`, { cause: error });
  }
};

export const deleteCustomer = async (id: number) => {
  try {
    await prisma.customer.delete({ where: { id } });
  } catch (error) {
    throw createHttpError(404, `Customer ${id} not found`, { cause: error });
  }
};
