"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVehicleSchema = exports.updateVehicleSchema = exports.createVehicleSchema = void 0;
const zod_1 = require("zod");
const baseVehicleSchema = zod_1.z.object({
    vin: zod_1.z.string().min(5),
    make: zod_1.z.string().min(1),
    model: zod_1.z.string().min(1),
    year: zod_1.z
        .number()
        .int()
        .gte(1900)
        .lte(new Date().getFullYear() + 1),
    licensePlate: zod_1.z.string().optional().nullable(),
    mileage: zod_1.z.number().int().nonnegative().optional().nullable(),
    color: zod_1.z.string().optional().nullable(),
    engine: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
    customerId: zod_1.z.number().int().positive(),
});
exports.createVehicleSchema = zod_1.z.object({
    body: baseVehicleSchema,
});
exports.updateVehicleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
    body: baseVehicleSchema.partial(),
});
exports.getVehicleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().transform((value) => parseInt(value, 10)),
    }),
});
//# sourceMappingURL=vehicle.schema.js.map