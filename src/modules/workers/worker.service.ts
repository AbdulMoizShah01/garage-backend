import { Prisma } from "@prisma/client";
import createHttpError from "http-errors";
import { startOfDay, startOfMonth, addDays, addMonths } from "date-fns";

import { prisma } from "../../lib/prisma";

const decimal = (value?: number) =>
  value !== undefined ? new Prisma.Decimal(value.toFixed(2)) : undefined;

const toDate = (value?: string) =>
  value ? new Date(value) : undefined;

const salaryPeriodStart = (
  date: Date,
  frequency: "DAILY" | "MONTHLY",
) => (frequency === "MONTHLY" ? startOfMonth(date) : startOfDay(date));

const salaryNextPeriodStart = (
  currentStart: Date,
  frequency: "DAILY" | "MONTHLY",
) =>
  frequency === "MONTHLY"
    ? startOfMonth(addMonths(currentStart, 1))
    : startOfDay(addDays(currentStart, 1));

const normalizeFrequency = (value?: string | null): "DAILY" | "MONTHLY" =>
  value === "DAILY" ? "DAILY" : "MONTHLY";

const withSalaryMeta = <T extends { salaryFrequency: string | null; lastSalaryPaidAt: Date | null }>(
  worker: T,
) => {
  const frequency = normalizeFrequency(worker.salaryFrequency);
  const now = new Date();
  const currentPeriodStart = salaryPeriodStart(now, frequency);
  const lastPaidAt = worker.lastSalaryPaidAt
    ? new Date(worker.lastSalaryPaidAt)
    : null;
  const isPaidThisPeriod =
    lastPaidAt !== null && lastPaidAt >= currentPeriodStart;
  const isSalaryDue = !isPaidThisPeriod;
  const nextSalaryDueOn = isPaidThisPeriod
    ? salaryNextPeriodStart(currentPeriodStart, frequency)
    : currentPeriodStart;

  return {
    ...worker,
    salaryFrequency: frequency,
    isSalaryDue,
    nextSalaryDueOn,
  };
};

export const listWorkers = async (search?: string) => {
  try {
    const workers = await prisma.worker.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
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

    return workers.map((worker) => withSalaryMeta(worker));
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

    return withSalaryMeta(worker);
  } catch (error) {
    maybeThrowSchemaSyncError(error);
    throw error;
  }
};

type WorkerInput = {
  name: string;
  phone?: string | null;
  salaryAmount?: number;
  salaryFrequency?: "DAILY" | "MONTHLY";
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
    const worker = await prisma.worker.create({
      data: {
        name: input.name,
        phone: input.phone ?? null,
        salaryAmount: decimal(input.salaryAmount ?? 0) ?? new Prisma.Decimal(0),
        salaryFrequency: input.salaryFrequency ?? "MONTHLY",
        commuteExpense: decimal(input.commuteExpense),
        shiftExpense: decimal(input.shiftExpense),
        mealExpense: decimal(input.mealExpense),
        otherExpense: decimal(input.otherExpense),
      },
    });

    return withSalaryMeta(worker);
  } catch (error) {
    maybeThrowSchemaSyncError(error);
    throw error;
  }
};

export const updateWorker = async (id: number, input: Partial<WorkerInput>) => {
  try {
    const data: Prisma.WorkerUpdateInput = {
      name: input.name,
      phone: input.phone,
    };

    if (input.salaryAmount !== undefined) {
      data.salaryAmount = decimal(input.salaryAmount) ?? new Prisma.Decimal(0);
    }

    if (input.salaryFrequency) {
      data.salaryFrequency = input.salaryFrequency;
    }

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

    const worker = await prisma.worker.update({
      where: { id },
      data,
    });

    return withSalaryMeta(worker);
  } catch (error) {
    maybeThrowSchemaSyncError(error);
    throw createHttpError(404, `Worker ${id} not found`, { cause: error });
  }
};

export const updateWorkerSalaryStatus = async (
  id: number,
  markAs: "PAID" | "UNPAID",
  paidAt?: string,
) => {
  const payload: Prisma.WorkerUpdateInput = {};

  if (markAs === "PAID") {
    payload.lastSalaryPaidAt = toDate(paidAt) ?? new Date();
  } else {
    payload.lastSalaryPaidAt = null;
  }

  try {
    const worker = await prisma.worker.update({
      where: { id },
      data: payload,
    });

    return withSalaryMeta(worker);
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
