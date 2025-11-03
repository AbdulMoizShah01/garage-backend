import { z } from "zod";

const baseVehicleSchema = z.object({
  vin: z.string().min(5),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z
    .number()
    .int()
    .gte(1900)
    .lte(new Date().getFullYear() + 1),
  licensePlate: z.string().optional().nullable(),
  mileage: z.number().int().nonnegative().optional().nullable(),
  color: z.string().optional().nullable(),
  engine: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  customerId: z.number().int().positive(),
});

export const createVehicleSchema = z.object({
  body: baseVehicleSchema,
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
  body: baseVehicleSchema.partial(),
});

export const getVehicleSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
});
