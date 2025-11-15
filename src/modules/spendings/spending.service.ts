import createHttpError from "http-errors";
import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";

const decimal = (value: number) =>
  new Prisma.Decimal(Number.isFinite(value) ? value.toFixed(2) : "0");

type SpendingFilters = {
  category?: string;
  from?: Date;
  to?: Date;
  search?: string;
};

export const listSpendings = async (filters: SpendingFilters = {}) => {
  const where: Prisma.SpendingWhereInput = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.from || filters.to) {
    where.incurredAt = {
      gte: filters.from,
      lte: filters.to,
    };
  }

  if (filters.search) {
    where.OR = [
      {
        description: {
          contains: filters.search,
        },
      },
    ];
  }

  return prisma.spending.findMany({
    where,
    orderBy: { incurredAt: "desc" },
  });
};

export const getSpendingById = async (id: number) => {
  const spending = await prisma.spending.findUnique({
    where: { id },
  });

  if (!spending) {
    throw createHttpError(404, `Spending ${id} not found`);
  }

  return spending;
};

type SpendingInput = {
  category: string;
  amount: number;
  description?: string | null;
  incurredAt?: string;
};

const toDate = (value?: string) => (value ? new Date(value) : undefined);

export const createSpending = async (input: SpendingInput) =>
  prisma.spending.create({
    data: {
      category: input.category,
      amount: decimal(input.amount),
      description: input.description ?? null,
      incurredAt: toDate(input.incurredAt) ?? new Date(),
    },
  });

export const updateSpending = async (id: number, input: Partial<SpendingInput>) => {
  try {
    return await prisma.spending.update({
      where: { id },
      data: {
        category: input.category,
        amount: input.amount !== undefined ? decimal(input.amount) : undefined,
        description: input.description ?? undefined,
        incurredAt: input.incurredAt ? toDate(input.incurredAt) : undefined,
      },
    });
  } catch (error) {
    throw createHttpError(404, `Spending ${id} not found`, { cause: error });
  }
};

export const deleteSpending = async (id: number) => {
  try {
    await prisma.spending.delete({
      where: { id },
    });
  } catch (error) {
    throw createHttpError(404, `Spending ${id} not found`, { cause: error });
  }
};
