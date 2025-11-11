import { Request, Response, NextFunction } from "express";

import {
  listWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
  updateWorkerSalaryStatus,
} from "./worker.service";

export const getWorkersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const workers = await listWorkers(search);
    res.json(workers);
  } catch (error) {
    next(error);
  }
};

export const getWorkerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workerId = Number(req.params.id);
    const worker = await getWorkerById(workerId);
    res.json(worker);
  } catch (error) {
    next(error);
  }
};

export const createWorkerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const worker = await createWorker(req.body);
    res.status(201).json(worker);
  } catch (error) {
    next(error);
  }
};

export const updateWorkerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workerId = Number(req.params.id);
    const worker = await updateWorker(workerId, req.body);
    res.json(worker);
  } catch (error) {
    next(error);
  }
};

export const deleteWorkerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workerId = Number(req.params.id);
    await deleteWorker(workerId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateWorkerSalaryStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workerId = Number(req.params.id);
    const { markAs, paidAt } = req.body as {
      markAs: "PAID" | "UNPAID";
      paidAt?: string;
    };
    const worker = await updateWorkerSalaryStatus(workerId, markAs, paidAt);
    res.json(worker);
  } catch (error) {
    next(error);
  }
};
