import { Request, Response, NextFunction } from "express";

import {
  listServiceItems,
  getServiceItemById,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
} from "./service.service";

export const getServiceItemsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const items = await listServiceItems(search);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getServiceItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemId = Number(req.params.id);
    const item = await getServiceItemById(itemId);
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const createServiceItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item = await createServiceItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const updateServiceItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemId = Number(req.params.id);
    const item = await updateServiceItem(itemId, req.body);
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const deleteServiceItemHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemId = Number(req.params.id);
    await deleteServiceItem(itemId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
