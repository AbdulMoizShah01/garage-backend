"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpending = exports.updateSpending = exports.createSpending = exports.getSpendingById = exports.listSpendings = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
const decimal = (value) => new client_1.Prisma.Decimal(Number.isFinite(value) ? value.toFixed(2) : "0");
const listSpendings = async (filters = {}) => {
    const where = {};
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
    return prisma_1.prisma.spending.findMany({
        where,
        orderBy: { incurredAt: "desc" },
    });
};
exports.listSpendings = listSpendings;
const getSpendingById = async (id) => {
    const spending = await prisma_1.prisma.spending.findUnique({
        where: { id },
    });
    if (!spending) {
        throw (0, http_errors_1.default)(404, `Spending ${id} not found`);
    }
    return spending;
};
exports.getSpendingById = getSpendingById;
const toDate = (value) => (value ? new Date(value) : undefined);
const createSpending = async (input) => prisma_1.prisma.spending.create({
    data: {
        category: input.category,
        amount: decimal(input.amount),
        description: input.description ?? null,
        incurredAt: toDate(input.incurredAt) ?? new Date(),
    },
});
exports.createSpending = createSpending;
const updateSpending = async (id, input) => {
    try {
        return await prisma_1.prisma.spending.update({
            where: { id },
            data: {
                category: input.category,
                amount: input.amount !== undefined ? decimal(input.amount) : undefined,
                description: input.description ?? undefined,
                incurredAt: input.incurredAt ? toDate(input.incurredAt) : undefined,
            },
        });
    }
    catch (error) {
        throw (0, http_errors_1.default)(404, `Spending ${id} not found`, { cause: error });
    }
};
exports.updateSpending = updateSpending;
const deleteSpending = async (id) => {
    try {
        await prisma_1.prisma.spending.delete({
            where: { id },
        });
    }
    catch (error) {
        throw (0, http_errors_1.default)(404, `Spending ${id} not found`, { cause: error });
    }
};
exports.deleteSpending = deleteSpending;
//# sourceMappingURL=spending.service.js.map