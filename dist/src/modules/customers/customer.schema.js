"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerSchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(1),
        phone: zod_1.z.string().min(5),
        email: zod_1.z.string().email().optional().nullable(),
        company: zod_1.z.string().optional().nullable(),
        notes: zod_1.z.string().optional().nullable(),
        addressLine1: zod_1.z.string().optional().nullable(),
        addressLine2: zod_1.z.string().optional().nullable(),
        city: zod_1.z.string().optional().nullable(),
        state: zod_1.z.string().optional().nullable(),
        postalCode: zod_1.z.string().optional().nullable(),
    }),
});
exports.updateCustomerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
    body: exports.createCustomerSchema.shape.body
        .partial()
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    }),
});
exports.getCustomerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
});
//# sourceMappingURL=customer.schema.js.map