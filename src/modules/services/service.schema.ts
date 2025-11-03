import { z } from "zod";

export const createServiceItemSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    defaultPrice: z.number().nonnegative(),
  }),
});

export const updateServiceItemSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
  body: z
    .object({
      name: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      defaultPrice: z.number().nonnegative().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const getServiceItemSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
});
