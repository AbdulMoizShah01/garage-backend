"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkerSalaryStatusSchema = exports.getWorkerSchema = exports.updateWorkerSchema = exports.createWorkerSchema = void 0;
const zod_1 = require("zod");
const optionalPhoneSchema = zod_1.z.preprocess((value) => {
    if (typeof value !== "string") {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
}, zod_1.z.string().min(5).optional());
const optionalMoneySchema = zod_1.z.preprocess((value) => {
    if (value === null || value === undefined || value === "") {
        return undefined;
    }
    if (typeof value === "string") {
        const normalized = value.trim();
        if (!normalized) {
            return undefined;
        }
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : value;
    }
    return value;
}, zod_1.z.number().nonnegative().optional());
const salaryFrequencySchema = zod_1.z
    .enum(["DAILY", "MONTHLY"])
    .optional()
    .default("MONTHLY");
const baseWorkerSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1)
        .transform((value) => value.trim()),
    phone: optionalPhoneSchema,
    salaryAmount: optionalMoneySchema,
    salaryFrequency: salaryFrequencySchema,
    commuteExpense: optionalMoneySchema,
    shiftExpense: optionalMoneySchema,
    mealExpense: optionalMoneySchema,
    otherExpense: optionalMoneySchema,
});
exports.createWorkerSchema = zod_1.z.object({
    body: baseWorkerSchema,
});
exports.updateWorkerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
    body: baseWorkerSchema
        .partial()
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    }),
});
exports.getWorkerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
});
exports.updateWorkerSalaryStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
    body: zod_1.z.object({
        markAs: zod_1.z.enum(["PAID", "UNPAID"]),
        paidAt: zod_1.z
            .string()
            .optional()
            .refine((value) => !value || !Number.isNaN(Date.parse(value)), "Invalid paidAt value"),
    }),
});
//# sourceMappingURL=worker.schema.js.map