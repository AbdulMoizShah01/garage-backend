import { Request, Response, NextFunction } from "express";

import { getInsightsSummary } from "./insights.service";

export const getInsightsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const summary = await getInsightsSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};
