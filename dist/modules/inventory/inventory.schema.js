"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryItemSchema = exports.updateInventoryItemSchema = exports.createInventoryItemSchema = void 0;
const zod_1 = require("zod");
const optionalTrimmedString = zod_1.z.preprocess((value) => {
    if (typeof value !== "string") {
        return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
}, zod_1.z.string().min(1, "Must contain at least 1 character").optional());
const baseItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    sku: optionalTrimmedString,
    description: zod_1.z.string().optional().nullable(),
    quantityOnHand: zod_1.z.number().int().nonnegative().default(0),
    reorderPoint: zod_1.z.number().int().nonnegative().default(0),
    unitCost: zod_1.z.number().nonnegative().default(0),
    unitPrice: zod_1.z.number().nonnegative().default(0),
});
exports.createInventoryItemSchema = zod_1.z.object({
    body: baseItemSchema,
});
exports.updateInventoryItemSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
    body: baseItemSchema.partial(),
});
exports.getInventoryItemSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
});
//# sourceMappingURL=inventory.schema.js.map