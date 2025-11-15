"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsightsSummary = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma_1 = require("../../lib/prisma");
const MONTHS_TO_REPORT = 6;
const DAILY_TO_MONTHLY_FACTOR = 26;
const decimalToNumber = (value) => value instanceof client_1.Prisma.Decimal ? value.toNumber() : Number(value ?? 0);
const getInsightsSummary = async () => {
    const now = new Date();
    const windowStart = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, MONTHS_TO_REPORT - 1));
    const [periodOrders, workers, vehicleCount, statusGroups, servicesSoldAgg, partsSoldAgg, spendings,] = await Promise.all([
        prisma_1.prisma.workOrder.findMany({
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
        prisma_1.prisma.worker.findMany(),
        prisma_1.prisma.vehicle.count(),
        prisma_1.prisma.workOrder.groupBy({
            by: ["status"],
            _count: { _all: true },
            where: {
                createdAt: {
                    gte: windowStart,
                },
            },
        }),
        prisma_1.prisma.workOrderLineItem.aggregate({
            _sum: { quantity: true },
            where: {
                serviceItemId: {
                    not: null,
                },
            },
        }),
        prisma_1.prisma.workOrderLineItem.aggregate({
            _sum: { quantity: true },
            where: {
                inventoryItemId: {
                    not: null,
                },
            },
        }),
        prisma_1.prisma.spending.findMany({
            where: {
                incurredAt: {
                    gte: windowStart,
                },
            },
        }),
    ]);
    const completedOrders = periodOrders.filter((order) => order.status === "COMPLETED");
    const netEarned = completedOrders.reduce((sum, order) => sum + decimalToNumber(order.totalCost), 0);
    const partsExpense = periodOrders.reduce((sum, order) => sum + decimalToNumber(order.partsCost), 0);
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
    const spendingsTotal = spendings.reduce((sum, spending) => sum + decimalToNumber(spending.amount), 0);
    const netExpense = partsExpense + workerExpenseTotal + salaryBudget + spendingsTotal;
    const netProfit = netEarned - netExpense;
    const monthlyBuckets = Array.from({ length: MONTHS_TO_REPORT }).map((_, index) => {
        const monthDate = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, MONTHS_TO_REPORT - 1 - index));
        const revenue = completedOrders
            .filter((order) => (0, date_fns_1.isSameMonth)(order.createdAt, monthDate))
            .reduce((sum, order) => sum + decimalToNumber(order.totalCost), 0);
        const expensesFromOrders = periodOrders
            .filter((order) => (0, date_fns_1.isSameMonth)(order.createdAt, monthDate))
            .reduce((sum, order) => sum + decimalToNumber(order.partsCost), 0);
        const expensesFromSpendings = spendings
            .filter((spending) => (0, date_fns_1.isSameMonth)(spending.incurredAt, monthDate))
            .reduce((sum, spending) => sum + decimalToNumber(spending.amount), 0);
        return {
            label: (0, date_fns_1.format)(monthDate, "MMM yyyy"),
            revenue,
            expenses: expensesFromOrders + expensesFromSpendings,
        };
    });
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
        spendingsTotal,
        servicesSold: servicesSoldAgg._sum.quantity ?? 0,
        partsSold: partsSoldAgg._sum.quantity ?? 0,
        workOrdersByStatus,
        monthlyRevenue: monthlyBuckets,
    };
};
exports.getInsightsSummary = getInsightsSummary;
//# sourceMappingURL=insights.service.js.map