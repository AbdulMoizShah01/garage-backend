import { Request, Response, NextFunction } from "express";

import { getDashboardSummary } from "./dashboard.service";

export const getDashboardSummaryHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const summary = await getDashboardSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};
