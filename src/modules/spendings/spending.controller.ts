import { Request, Response, NextFunction } from "express";

import {
  listSpendings,
  getSpendingById,
  createSpending,
  updateSpending,
  deleteSpending,
} from "./spending.service";

const parseDate = (value?: string) => {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const getSpendingsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters = {
      category:
        typeof req.query.category === "string" ? req.query.category : undefined,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      from:
        typeof req.query.from === "string" ? parseDate(req.query.from) : undefined,
      to:
        typeof req.query.to === "string" ? parseDate(req.query.to) : undefined,
    };

    const spendings = await listSpendings(filters);
    res.json(spendings);
  } catch (error) {
    next(error);
  }
};

export const getSpendingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spendingId = Number(req.params.id);
    const spending = await getSpendingById(spendingId);
    res.json(spending);
  } catch (error) {
    next(error);
  }
};

export const createSpendingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spending = await createSpending(req.body);
    res.status(201).json(spending);
  } catch (error) {
    next(error);
  }
};

export const updateSpendingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spendingId = Number(req.params.id);
    const spending = await updateSpending(spendingId, req.body);
    res.json(spending);
  } catch (error) {
    next(error);
  }
};

export const deleteSpendingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const spendingId = Number(req.params.id);
    await deleteSpending(spendingId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
