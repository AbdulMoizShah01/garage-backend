import { z } from "zod";

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.string().min(1, "Must contain at least 1 character").optional(),
);

const baseItemSchema = z.object({
  name: z.string().min(1),
  sku: optionalTrimmedString,
  description: z.string().optional().nullable(),
  quantityOnHand: z.number().int().nonnegative().default(0),
  reorderPoint: z.number().int().nonnegative().default(0),
  unitCost: z.number().nonnegative().default(0),
  unitPrice: z.number().nonnegative().default(0),
});

export const createInventoryItemSchema = z.object({
  body: baseItemSchema,
});

export const updateInventoryItemSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
  body: baseItemSchema.partial(),
});

export const getInventoryItemSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
});
