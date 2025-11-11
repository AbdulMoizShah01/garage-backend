"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataSchema = exports.updateMetadataSchema = exports.createMetadataSchema = void 0;
const zod_1 = require("zod");
const optionalString = zod_1.z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined));
const customerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(5),
    email: optionalString,
    company: optionalString,
    notes: optionalString,
    addressLine1: optionalString,
    addressLine2: optionalString,
    city: optionalString,
    state: optionalString,
    postalCode: optionalString,
});
const vehicleSchema = zod_1.z.object({
    vin: zod_1.z.string().min(6),
    make: zod_1.z.string().min(1),
    model: zod_1.z.string().min(1),
    year: zod_1.z.number().int().min(1900),
    licensePlate: optionalString,
    mileage: zod_1.z.number().int().nonnegative().optional(),
    color: optionalString,
    engine: optionalString,
    notes: optionalString,
});
exports.createMetadataSchema = zod_1.z.object({
    body: zod_1.z.object({
        customer: customerSchema,
        vehicle: vehicleSchema,
    }),
});
exports.updateMetadataSchema = zod_1.z.object({
    params: zod_1.z.object({
        vehicleId: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
    body: zod_1.z
        .object({
        customer: customerSchema.partial(),
        vehicle: vehicleSchema.partial(),
    })
        .partial()
        .refine((value) => value.customer || value.vehicle, {
        message: "Provide customer or vehicle fields to update",
    }),
});
exports.getMetadataSchema = zod_1.z.object({
    params: zod_1.z.object({
        vehicleId: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
});
//# sourceMappingURL=metadata.schema.js.map