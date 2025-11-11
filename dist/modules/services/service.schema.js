"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceItemSchema = exports.updateServiceItemSchema = exports.createServiceItemSchema = void 0;
const zod_1 = require("zod");
exports.createServiceItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        description: zod_1.z.string().optional().nullable(),
        defaultPrice: zod_1.z.number().nonnegative(),
    }),
});
exports.updateServiceItemSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().optional().nullable(),
        defaultPrice: zod_1.z.number().nonnegative().optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    }),
});
exports.getServiceItemSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
});
//# sourceMappingURL=service.schema.js.map