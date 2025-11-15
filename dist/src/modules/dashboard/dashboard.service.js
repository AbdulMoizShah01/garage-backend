"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = void 0;
const date_fns_1 = require("date-fns");
const prisma_1 = require("../../lib/prisma");
const insights_service_1 = require("../insights/insights.service");
const LOW_STOCK_THRESHOLD = 5;
const getDashboardSummary = async () => {
    const [customers, openWorkOrders, completedWorkOrders, inventoryItems, workers, insightsSummary,] = await Promise.all([
        prisma_1.prisma.customer.count(),
        prisma_1.prisma.workOrder.count({
            where: {
                status: { in: ["PENDING", "IN_PROGRESS"] },
            },
        }),
        prisma_1.prisma.workOrder.findMany({
            where: {
                status: "COMPLETED",
                updatedAt: {
                    gte: (0, date_fns_1.subDays)(new Date(), 30),
                },
            },
            select: {
                id: true,
                code: true,
                totalCost: true,
                updatedAt: true,
            },
            orderBy: { updatedAt: "desc" },
            take: 10,
        }),
        prisma_1.prisma.inventoryItem.findMany({
            orderBy: { quantityOnHand: "asc" },
        }),
        prisma_1.prisma.worker.findMany({
            orderBy: [
                { totalJobs: "desc" },
                { totalServices: "desc" },
                { name: "asc" },
            ],
            take: 8,
            select: {
                id: true,
                name: true,
                totalJobs: true,
                totalServices: true,
                assignments: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: {
                        createdAt: true,
                        workOrder: {
                            select: {
                                id: true,
                                code: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        }),
        (0, insights_service_1.getInsightsSummary)(),
    ]);
    const revenueLast30Days = completedWorkOrders.reduce((sum, order) => sum + order.totalCost.toNumber(), 0);
    const criticalInventory = inventoryItems.filter((item) => item.quantityOnHand <= LOW_STOCK_THRESHOLD);
    return {
        totals: {
            customers,
            vehicles: insightsSummary.vehicleCount,
            openWorkOrders,
        },
        revenueLast30Days,
        financials: {
            netEarned: insightsSummary.netEarned,
            netExpense: insightsSummary.netExpense,
            netProfit: insightsSummary.netProfit,
            spendings: insightsSummary.spendingsTotal,
        },
        recentCompletedWorkOrders: completedWorkOrders,
        inventoryAlertsCount: criticalInventory.length,
        lowStockItems: criticalInventory.slice(0, 5),
        topWorkers: workers.map((worker) => ({
            id: worker.id,
            name: worker.name,
            totalJobs: worker.totalJobs,
            totalServices: worker.totalServices,
            lastAssignment: worker.assignments[0]
                ? {
                    createdAt: worker.assignments[0].createdAt,
                    workOrder: worker.assignments[0].workOrder,
                }
                : null,
        })),
    };
};
exports.getDashboardSummary = getDashboardSummary;
//# sourceMappingURL=dashboard.service.js.map