import { Request, Response, NextFunction } from "express";

import {
  listInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "./inventory.service";

export const getInventoryItemsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const items = await listInventoryItems(search);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getInventoryItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemId = Number(req.params.id);
    const item = await getInventoryItemById(itemId);
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const createInventoryItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item = await createInventoryItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemId = Number(req.params.id);
    const item = await updateInventoryItem(itemId, req.body);
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const deleteInventoryItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemId = Number(req.params.id);
    await deleteInventoryItem(itemId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
