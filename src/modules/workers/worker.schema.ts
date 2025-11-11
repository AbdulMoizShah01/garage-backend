import { z } from "zod";

const optionalPhoneSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}, z.string().min(5).optional());

const optionalMoneySchema = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized) {
      return undefined;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : value;
  }

  return value;
}, z.number().nonnegative().optional());

const salaryFrequencySchema = z
  .enum(["DAILY", "MONTHLY"])
  .optional()
  .default("MONTHLY");

const baseWorkerSchema = z.object({
  name: z
    .string()
    .min(1)
    .transform((value) => value.trim()),
  phone: optionalPhoneSchema,
  salaryAmount: optionalMoneySchema,
  salaryFrequency: salaryFrequencySchema,
  commuteExpense: optionalMoneySchema,
  shiftExpense: optionalMoneySchema,
  mealExpense: optionalMoneySchema,
  otherExpense: optionalMoneySchema,
});

export const createWorkerSchema = z.object({
  body: baseWorkerSchema,
});

export const updateWorkerSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
  body: baseWorkerSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const getWorkerSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
});

export const updateWorkerSalaryStatusSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
  body: z.object({
    markAs: z.enum(["PAID", "UNPAID"]),
    paidAt: z
      .string()
      .optional()
      .refine(
        (value) => !value || !Number.isNaN(Date.parse(value)),
        "Invalid paidAt value",
      ),
  }),
});
