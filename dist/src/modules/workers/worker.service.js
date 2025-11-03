"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorker = exports.updateWorker = exports.createWorker = exports.getWorkerById = exports.listWorkers = void 0;
const client_1 = require("@prisma/client");
const http_errors_1 = __importDefault(require("http-errors"));
const prisma_1 = require("../../lib/prisma");
const decimal = (value) => value !== undefined ? new client_1.Prisma.Decimal(value.toFixed(2)) : undefined;
const listWorkers = async (search) => {
    try {
        return await prisma_1.prisma.worker.findMany({
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
    }
    catch (error) {
        maybeThrowSchemaSyncError(error);
        throw error;
    }
};
exports.listWorkers = listWorkers;
const getWorkerById = async (id) => {
    try {
        const worker = await prisma_1.prisma.worker.findUnique({
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
            throw (0, http_errors_1.default)(404, `Worker ${id} not found`);
        }
        return worker;
    }
    catch (error) {
        maybeThrowSchemaSyncError(error);
        throw error;
    }
};
exports.getWorkerById = getWorkerById;
const maybeThrowSchemaSyncError = (error) => {
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
        error.code === "P2021") {
        throw (0, http_errors_1.default)(500, "Worker storage is unavailable because the database schema is out of date. Run `npm run db:setup` to sync it.", { cause: error });
    }
};
const createWorker = async (input) => {
    try {
        return await prisma_1.prisma.worker.create({
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
    }
    catch (error) {
        maybeThrowSchemaSyncError(error);
        throw error;
    }
};
exports.createWorker = createWorker;
const updateWorker = async (id, input) => {
    try {
        const data = {
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
        return await prisma_1.prisma.worker.update({
            where: { id },
            data,
        });
    }
    catch (error) {
        maybeThrowSchemaSyncError(error);
        throw (0, http_errors_1.default)(404, `Worker ${id} not found`, { cause: error });
    }
};
exports.updateWorker = updateWorker;
const deleteWorker = async (id) => {
    const assignmentCount = await prisma_1.prisma.workOrderAssignment.count({
        where: { workerId: id },
    });
    if (assignmentCount > 0) {
        throw (0, http_errors_1.default)(409, "Cannot delete worker with existing job assignments");
    }
    try {
        await prisma_1.prisma.worker.delete({ where: { id } });
    }
    catch (error) {
        maybeThrowSchemaSyncError(error);
        throw (0, http_errors_1.default)(404, `Worker ${id} not found`, { cause: error });
    }
};
exports.deleteWorker = deleteWorker;
//# sourceMappingURL=worker.service.js.map