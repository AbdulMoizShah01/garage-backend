import { z } from "zod";

export const createCustomerSchema = z.object({
  body: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(5),
    email: z.string().email().optional().nullable(),
    company: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    addressLine1: z.string().optional().nullable(),
    addressLine2: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
  body: createCustomerSchema.shape.body
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const getCustomerSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
});
