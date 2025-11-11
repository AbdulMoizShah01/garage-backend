import { Prisma } from "@prisma/client";
import {
  startOfMonth,
  subMonths,
  isSameMonth,
  format,
} from "date-fns";

import { prisma } from "../../lib/prisma";

const MONTHS_TO_REPORT = 6;
const DAILY_TO_MONTHLY_FACTOR = 26;

const decimalToNumber = (value: Prisma.Decimal | null | undefined) =>
  value instanceof Prisma.Decimal ? value.toNumber() : Number(value ?? 0);

export const getInsightsSummary = async () => {
  const now = new Date();
  const windowStart = startOfMonth(subMonths(now, MONTHS_TO_REPORT - 1));

  const [
    periodOrders,
    workers,
    vehicleCount,
    statusGroups,
    servicesSoldAgg,
    partsSoldAgg,
  ] = await Promise.all([
    prisma.workOrder.findMany({
      where: {
        createdAt: {
          gte: windowStart,
        },
      },
      select: {
        status: true,
        totalCost: true,
        partsCost: true,
        laborCost: true,
        taxes: true,
        createdAt: true,
      },
    }),
    prisma.worker.findMany(),
    prisma.vehicle.count(),
    prisma.workOrder.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: {
        createdAt: {
          gte: windowStart,
        },
      },
    }),
    prisma.workOrderLineItem.aggregate({
      _sum: { quantity: true },
      where: {
        serviceItemId: {
          not: null,
        },
      },
    }),
    prisma.workOrderLineItem.aggregate({
      _sum: { quantity: true },
      where: {
        inventoryItemId: {
          not: null,
        },
      },
    }),
  ]);

  const completedOrders = periodOrders.filter(
    (order) => order.status === "COMPLETED",
  );
  const netEarned = completedOrders.reduce(
    (sum, order) => sum + decimalToNumber(order.totalCost),
    0,
  );
  const partsExpense = periodOrders.reduce(
    (sum, order) => sum + decimalToNumber(order.partsCost),
    0,
  );
  const workerExpenseTotal = workers.reduce((sum, worker) => {
    const commute = decimalToNumber(worker.commuteExpense);
    const shift = decimalToNumber(worker.shiftExpense);
    const meal = decimalToNumber(worker.mealExpense);
    const other = decimalToNumber(worker.otherExpense);
    return sum + commute + shift + meal + other;
  }, 0);
  const salaryBudget = workers.reduce((sum, worker) => {
    const salary = decimalToNumber(worker.salaryAmount);
    if (!salary) {
      return sum;
    }

    if (worker.salaryFrequency === "DAILY") {
      return sum + salary * DAILY_TO_MONTHLY_FACTOR;
    }

    return sum + salary;
  }, 0);

  const netExpense = partsExpense + workerExpenseTotal + salaryBudget;
  const netProfit = netEarned - netExpense;

  const monthlyBuckets = Array.from({ length: MONTHS_TO_REPORT }).map(
    (_, index) => {
      const monthDate = startOfMonth(subMonths(now, MONTHS_TO_REPORT - 1 - index));
      const revenue = completedOrders
        .filter((order) => isSameMonth(order.createdAt, monthDate))
        .reduce((sum, order) => sum + decimalToNumber(order.totalCost), 0);
      const expenses = periodOrders
        .filter((order) => isSameMonth(order.createdAt, monthDate))
        .reduce((sum, order) => sum + decimalToNumber(order.partsCost), 0);

      return {
        label: format(monthDate, "MMM yyyy"),
        revenue,
        expenses,
      };
    },
  );

  const workOrdersByStatus = statusGroups.map((group) => ({
    status: group.status,
    count: group._count._all,
  }));

  return {
    netEarned,
    netExpense,
    netProfit,
    vehicleCount,
    partsExpense,
    servicesSold: servicesSoldAgg._sum.quantity ?? 0,
    partsSold: partsSoldAgg._sum.quantity ?? 0,
    workOrdersByStatus,
    monthlyRevenue: monthlyBuckets,
  };
};
