import { z } from "zod";

export const WORK_ORDER_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export const WORK_ORDER_MODES = ["NEW", "HISTORICAL"] as const;

const serviceLineItemSchema = z.object({
  type: z.literal("SERVICE"),
  serviceItemId: z.number().int().positive().optional(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().nonnegative(),
});

const partLineItemSchema = z.object({
  type: z.literal("PART"),
  inventoryItemId: z.number().int().positive().optional(),
  name: z.string().min(1),
  sku: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().nonnegative(),
  initialStock: z.number().int().nonnegative().optional(),
});

const lineItemSchema = z.discriminatedUnion("type", [
  serviceLineItemSchema,
  partLineItemSchema,
]);

const assignmentSchema = z
  .object({
    workerId: z.number().int().positive().optional(),
    workerName: z.string().min(1).optional(),
    role: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    servicesCount: z.number().int().nonnegative().optional(),
  })
  .refine((data) => data.workerId || data.workerName, {
    message: "workerId or workerName is required to assign a worker",
  });

const dateTimeString = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date/time value",
  });

const optionalDateTimeString = dateTimeString.optional().nullable();

const baseWorkOrderSchema = z.object({
  vehicleId: z.number().int().positive(),
  customerId: z.number().int().positive().optional().nullable(),
  description: z.string().min(1),
  status: z.enum(WORK_ORDER_STATUSES).default("IN_PROGRESS"),
  mode: z.enum(WORK_ORDER_MODES).default("NEW"),
  arrivalDate: dateTimeString,
  quotedAt: optionalDateTimeString,
  scheduledDate: optionalDateTimeString,
  completedDate: optionalDateTimeString,
  createdAtOverride: optionalDateTimeString,
  laborCost: z.number().nonnegative().optional(),
  partsCost: z.number().nonnegative().optional(),
  taxes: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  parkingCharge: z.number().nonnegative().optional(),
  notes: z.string().optional().nullable(),
  isHistorical: z.boolean().optional(),
  lineItems: z.array(lineItemSchema).default([]),
  assignments: z.array(assignmentSchema).default([]),
});

export const createWorkOrderSchema = z.object({
  body: baseWorkOrderSchema,
});

export const updateWorkOrderSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
  body: baseWorkOrderSchema.partial(),
});

export const getWorkOrderSchema = z.object({
  params: z.object({
    id: z.string().transform((value) => parseInt(value, 10)),
  }),
});

export type WorkOrderLineItemInput = z.infer<typeof lineItemSchema>;
export type WorkOrderAssignmentInput = z.infer<typeof assignmentSchema>;
export type WorkOrderPayload = z.infer<typeof baseWorkOrderSchema>;
