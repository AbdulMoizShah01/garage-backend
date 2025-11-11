"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorker = exports.updateWorkerSalaryStatus = exports.updateWorker = exports.createWorker = exports.getWorkerById = exports.listWorkers = void 0;
const client_1 = require("@prisma/client");
const http_errors_1 = __importDefault(require("http-errors"));
const date_fns_1 = require("date-fns");
const prisma_1 = require("../../lib/prisma");
const decimal = (value) => value !== undefined ? new client_1.Prisma.Decimal(value.toFixed(2)) : undefined;
const toDate = (value) => value ? new Date(value) : undefined;
const salaryPeriodStart = (date, frequency) => (frequency === "MONTHLY" ? (0, date_fns_1.startOfMonth)(date) : (0, date_fns_1.startOfDay)(date));
const salaryNextPeriodStart = (currentStart, frequency) => frequency === "MONTHLY"
    ? (0, date_fns_1.startOfMonth)((0, date_fns_1.addMonths)(currentStart, 1))
    : (0, date_fns_1.startOfDay)((0, date_fns_1.addDays)(currentStart, 1));
const normalizeFrequency = (value) => value === "DAILY" ? "DAILY" : "MONTHLY";
const withSalaryMeta = (worker) => {
    const frequency = normalizeFrequency(worker.salaryFrequency);
    const now = new Date();
    const currentPeriodStart = salaryPeriodStart(now, frequency);
    const lastPaidAt = worker.lastSalaryPaidAt
        ? new Date(worker.lastSalaryPaidAt)
        : null;
    const isPaidThisPeriod = lastPaidAt !== null && lastPaidAt >= currentPeriodStart;
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
const listWorkers = async (search) => {
    try {
        const workers = await prisma_1.prisma.worker.findMany({
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
        return withSalaryMeta(worker);
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
        const worker = await prisma_1.prisma.worker.create({
            data: {
                name: input.name,
                phone: input.phone ?? null,
                salaryAmount: decimal(input.salaryAmount ?? 0) ?? new client_1.Prisma.Decimal(0),
                salaryFrequency: input.salaryFrequency ?? "MONTHLY",
                commuteExpense: decimal(input.commuteExpense),
                shiftExpense: decimal(input.shiftExpense),
                mealExpense: decimal(input.mealExpense),
                otherExpense: decimal(input.otherExpense),
            },
        });
        return withSalaryMeta(worker);
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
            phone: input.phone,
        };
        if (input.salaryAmount !== undefined) {
            data.salaryAmount = decimal(input.salaryAmount) ?? new client_1.Prisma.Decimal(0);
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
        const worker = await prisma_1.prisma.worker.update({
            where: { id },
            data,
        });
        return withSalaryMeta(worker);
    }
    catch (error) {
        maybeThrowSchemaSyncError(error);
        throw (0, http_errors_1.default)(404, `Worker ${id} not found`, { cause: error });
    }
};
exports.updateWorker = updateWorker;
const updateWorkerSalaryStatus = async (id, markAs, paidAt) => {
    const payload = {};
    if (markAs === "PAID") {
        payload.lastSalaryPaidAt = toDate(paidAt) ?? new Date();
    }
    else {
        payload.lastSalaryPaidAt = null;
    }
    try {
        const worker = await prisma_1.prisma.worker.update({
            where: { id },
            data: payload,
        });
        return withSalaryMeta(worker);
    }
    catch (error) {
        maybeThrowSchemaSyncError(error);
        throw (0, http_errors_1.default)(404, `Worker ${id} not found`, { cause: error });
    }
};
exports.updateWorkerSalaryStatus = updateWorkerSalaryStatus;
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