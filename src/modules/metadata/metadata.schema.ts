import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const customerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(5),
  email: optionalString,
  company: optionalString,
  notes: optionalString,
  addressLine1: optionalString,
  addressLine2: optionalString,
  city: optionalString,
  state: optionalString,
  postalCode: optionalString,
});

const vehicleSchema = z.object({
  vin: z.string().min(6),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900),
  licensePlate: optionalString,
  mileage: z.number().int().nonnegative().optional(),
  color: optionalString,
  engine: optionalString,
  notes: optionalString,
});

export const createMetadataSchema = z.object({
  body: z.object({
    customer: customerSchema,
    vehicle: vehicleSchema,
  }),
});

export const updateMetadataSchema = z.object({
  params: z.object({
    vehicleId: z.string().transform((value) => parseInt(value, 10)),
  }),
  body: z
    .object({
      customer: customerSchema.partial(),
      vehicle: vehicleSchema.partial(),
    })
    .partial()
    .refine((value) => value.customer || value.vehicle, {
      message: "Provide customer or vehicle fields to update",
    }),
});

export const getMetadataSchema = z.object({
  params: z.object({
    vehicleId: z.string().transform((value) => parseInt(value, 10)),
  }),
});

export type MetadataCreatePayload = z.infer<
  typeof createMetadataSchema
>["body"];
export type MetadataUpdatePayload = z.infer<
  typeof updateMetadataSchema
>["body"];
