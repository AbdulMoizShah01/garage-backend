import { z } from "zod";

export const SPENDING_CATEGORIES = [
  "PREMISES_RENT",
  "WATER",
  "ELECTRICITY",
  "LOGISTICS",
  "MAINTENANCE",
  "PROCUREMENT",
  "MISCELLANEOUS",
] as const;

const amountSchema = z
  .number()
  .finite()
  .nonnegative();

const dateStringSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || !Number.isNaN(Date.parse(value)),
    "Invalid date value",
  );

const baseSchema = z.object({
  category: z.enum(SPENDING_CATEGORIES),
  amount: amountSchema,
  description: z.string().max(500).optional().nullable(),
  incurredAt: dateStringSchema,
});

export const createSpendingSchema = z.object({
  body: baseSchema,
});

export const updateSpendingSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
  body: baseSchema.partial().refine(
    (value) => Object.keys(value).length > 0,
    "At least one field must be provided",
  ),
});

export const getSpendingSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
});
