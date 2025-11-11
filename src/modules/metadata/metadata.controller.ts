import { Request, Response, NextFunction } from "express";

import {
  listMetadata,
  getMetadataByVehicleId,
  createMetadata,
  updateMetadata,
  deleteMetadata,
} from "./metadata.service";

export const getMetadataCollectionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const records = await listMetadata(search);
    res.json(records);
  } catch (error) {
    next(error);
  }
};

export const createMetadataHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const record = await createMetadata(req.body);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

export const getMetadataHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const record = await getMetadataByVehicleId(vehicleId);
    res.json(record);
  } catch (error) {
    next(error);
  }
};

export const updateMetadataHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const record = await updateMetadata(vehicleId, req.body);
    res.json(record);
  } catch (error) {
    next(error);
  }
};

export const deleteMetadataHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    await deleteMetadata(vehicleId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
