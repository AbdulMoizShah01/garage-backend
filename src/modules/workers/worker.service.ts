import { Prisma } from "@prisma/client";
import createHttpError from "http-errors";

import { prisma } from "../../lib/prisma";

const decimal = (value?: number) =>
  value !== undefined ? new Prisma.Decimal(value.toFixed(2)) : undefined;

export const listWorkers = async (search?: string) => {
  try {
    return await prisma.worker.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : undefined,
      orderBy: [
        { totalJobs: "desc" },
        { totalServices: "desc" },
        { name: "asc" },
      ],
      take: search ? 25 : undefined,
    });
  } catch (error) {
    maybeThrowSchemaSyncError(error);
    throw error;
  }
};

export const getWorkerById = async (id: number) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: {
        assignments: {
          orderBy: { createdAt: "desc" },
          include: {
            workOrder: {
              select: {
                id: true,
                code: true,
                status: true,
                createdAt: true,
                totalCost: true,
              },
            },
          },
        },
      },
    });

    if (!worker) {
      throw createHttpError(404, `Worker ${id} not found`);
    }

    return worker;
  } catch (error) {
    maybeThrowSchemaSyncError(error);
    throw error;
  }
};

type WorkerInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  commuteExpense?: number;
  shiftExpense?: number;
  mealExpense?: number;
  otherExpense?: number;
};

const maybeThrowSchemaSyncError = (error: unknown) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021"
  ) {
    throw createHttpError(
      500,
      "Worker storage is unavailable because the database schema is out of date. Run `npm run db:setup` to sync it.",
      { cause: error },
    );
  }
};

export const createWorker = async (input: WorkerInput) => {
  try {
    return await prisma.worker.create({
      data: {
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        commuteExpense: decimal(input.commuteExpense),
        shiftExpense: decimal(input.shiftExpense),
        mealExpense: decimal(input.mealExpense),
        otherExpense: decimal(input.otherExpense),
      },
    });
  } catch (error) {
    maybeThrowSchemaSyncError(error);
    throw error;
  }
};

export const updateWorker = async (id: number, input: Partial<WorkerInput>) => {
  try {
    const data: Prisma.WorkerUpdateInput = {
      name: input.name,
      email: input.email,
      phone: input.phone,
    };

    if (input.commuteExpense !== undefined) {
      data.commuteExpense = decimal(input.commuteExpense);
    }

    if (input.shiftExpense !== undefined) {
      data.shiftExpense = decimal(input.shiftExpense);
    }

    if (input.mealExpense !== undefined) {
      data.mealExpense = decimal(input.mealExpense);
    }

    if (input.otherExpense !== undefined) {
      data.otherExpense = decimal(input.otherExpense);
    }

    return await prisma.worker.update({
      where: { id },
      data,
    });
  } catch (error) {
    maybeThrowSchemaSyncError(error);
    throw createHttpError(404, `Worker ${id} not found`, { cause: error });
  }
};

export const deleteWorker = async (id: number) => {
  const assignmentCount = await prisma.workOrderAssignment.count({
    where: { workerId: id },
  });

  if (assignmentCount > 0) {
    throw createHttpError(
      409,
      "Cannot delete worker with existing job assignments",
    );
  }

  try {
    await prisma.worker.delete({ where: { id } });
  } catch (error) {
    maybeThrowSchemaSyncError(error);
    throw createHttpError(404, `Worker ${id} not found`, { cause: error });
  }
};
