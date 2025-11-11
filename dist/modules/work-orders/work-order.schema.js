"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkOrderSchema = exports.updateWorkOrderSchema = exports.createWorkOrderSchema = exports.WORK_ORDER_MODES = exports.WORK_ORDER_STATUSES = void 0;
const zod_1 = require("zod");
exports.WORK_ORDER_STATUSES = [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
];
exports.WORK_ORDER_MODES = ["NEW", "HISTORICAL"];
const serviceLineItemSchema = zod_1.z.object({
    type: zod_1.z.literal("SERVICE"),
    serviceItemId: zod_1.z.number().int().positive().optional(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional().nullable(),
    quantity: zod_1.z.number().int().positive().default(1),
    unitPrice: zod_1.z.number().nonnegative(),
});
const partLineItemSchema = zod_1.z.object({
    type: zod_1.z.literal("PART"),
    inventoryItemId: zod_1.z.number().int().positive().optional(),
    name: zod_1.z.string().min(1),
    sku: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional().nullable(),
    quantity: zod_1.z.number().int().positive().default(1),
    unitPrice: zod_1.z.number().nonnegative(),
    initialStock: zod_1.z.number().int().nonnegative().optional(),
});
const lineItemSchema = zod_1.z.discriminatedUnion("type", [
    serviceLineItemSchema,
    partLineItemSchema,
]);
const assignmentSchema = zod_1.z
    .object({
    workerId: zod_1.z.number().int().positive().optional(),
    workerName: zod_1.z.string().min(1).optional(),
    role: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
    servicesCount: zod_1.z.number().int().nonnegative().optional(),
})
    .refine((data) => data.workerId || data.workerName, {
    message: "workerId or workerName is required to assign a worker",
});
const dateTimeString = zod_1.z
    .string()
    .min(1)
    .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date/time value",
});
const optionalDateTimeString = dateTimeString.optional().nullable();
const baseWorkOrderSchema = zod_1.z.object({
    vehicleId: zod_1.z.number().int().positive(),
    customerId: zod_1.z.number().int().positive().optional().nullable(),
    description: zod_1.z.string().min(1),
    status: zod_1.z.enum(exports.WORK_ORDER_STATUSES).default("IN_PROGRESS"),
    mode: zod_1.z.enum(exports.WORK_ORDER_MODES).default("NEW"),
    arrivalDate: dateTimeString,
    quotedAt: optionalDateTimeString,
    scheduledDate: optionalDateTimeString,
    completedDate: optionalDateTimeString,
    createdAtOverride: optionalDateTimeString,
    laborCost: zod_1.z.number().nonnegative().optional(),
    partsCost: zod_1.z.number().nonnegative().optional(),
    taxes: zod_1.z.number().nonnegative().optional(),
    discount: zod_1.z.number().nonnegative().optional(),
    parkingCharge: zod_1.z.number().nonnegative().optional(),
    notes: zod_1.z.string().optional().nullable(),
    isHistorical: zod_1.z.boolean().optional(),
    lineItems: zod_1.z.array(lineItemSchema).default([]),
    assignments: zod_1.z.array(assignmentSchema).default([]),
});
exports.createWorkOrderSchema = zod_1.z.object({
    body: baseWorkOrderSchema,
});
exports.updateWorkOrderSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
    body: baseWorkOrderSchema.partial(),
});
exports.getWorkOrderSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
});
//# sourceMappingURL=work-order.schema.js.map