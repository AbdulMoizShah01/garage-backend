"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpendingSchema = exports.updateSpendingSchema = exports.createSpendingSchema = exports.SPENDING_CATEGORIES = void 0;
const zod_1 = require("zod");
exports.SPENDING_CATEGORIES = [
    "PREMISES_RENT",
    "WATER",
    "ELECTRICITY",
    "LOGISTICS",
    "MAINTENANCE",
    "PROCUREMENT",
    "MISCELLANEOUS",
];
const amountSchema = zod_1.z
    .number()
    .finite()
    .nonnegative();
const dateStringSchema = zod_1.z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), "Invalid date value");
const baseSchema = zod_1.z.object({
    category: zod_1.z.enum(exports.SPENDING_CATEGORIES),
    amount: amountSchema,
    description: zod_1.z.string().max(500).optional().nullable(),
    incurredAt: dateStringSchema,
});
exports.createSpendingSchema = zod_1.z.object({
    body: baseSchema,
});
exports.updateSpendingSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
    body: baseSchema.partial().refine((value) => Object.keys(value).length > 0, "At least one field must be provided"),
});
exports.getSpendingSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
});
//# sourceMappingURL=spending.schema.js.map