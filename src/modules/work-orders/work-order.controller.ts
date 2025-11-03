import { Request, Response, NextFunction } from "express";

import {
  listWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  completeWorkOrder,
} from "./work-order.service";
import { WORK_ORDER_STATUSES } from "./work-order.schema";

const parseDate = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const parseBoolean = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return undefined;
};

export const getWorkOrdersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const statusQuery =
      typeof req.query.status === "string"
        ? req.query.status.toUpperCase()
        : undefined;
    const allowedStatuses = new Set<string>([...WORK_ORDER_STATUSES, "ALL"]);
    const status =
      statusQuery && allowedStatuses.has(statusQuery)
        ? (statusQuery as (typeof WORK_ORDER_STATUSES)[number] | "ALL")
        : undefined;
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const from =
      typeof req.query.from === "string"
        ? parseDate(req.query.from)
        : undefined;
    const to =
      typeof req.query.to === "string" ? parseDate(req.query.to) : undefined;
    const historical =
      typeof req.query.historical === "string"
        ? parseBoolean(req.query.historical)
        : undefined;

    const workOrders = await listWorkOrders({
      status,
      search,
      from,
      to,
      historical,
    });
    res.json(workOrders);
  } catch (error) {
    next(error);
  }
};

export const getWorkOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workOrderId = Number(req.params.id);
    const workOrder = await getWorkOrderById(workOrderId);
    res.json(workOrder);
  } catch (error) {
    next(error);
  }
};

export const createWorkOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workOrder = await createWorkOrder(req.body);
    res.status(201).json(workOrder);
  } catch (error) {
    next(error);
  }
};

export const updateWorkOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workOrderId = Number(req.params.id);
    const workOrder = await updateWorkOrder(workOrderId, req.body);
    res.json(workOrder);
  } catch (error) {
    next(error);
  }
};

export const deleteWorkOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workOrderId = Number(req.params.id);
    await deleteWorkOrder(workOrderId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const completeWorkOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workOrderId = Number(req.params.id);
    const workOrder = await completeWorkOrder(workOrderId);
    res.json(workOrder);
  } catch (error) {
    next(error);
  }
};
