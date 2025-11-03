import { Request, Response, NextFunction } from "express";

import {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "./vehicle.service";

export const getVehiclesHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicles = await listVehicles();
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
};

export const getVehicleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicleId = Number(req.params.id);
    const vehicle = await getVehicleById(vehicleId);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};

export const createVehicleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicle = await createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
};

export const updateVehicleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicleId = Number(req.params.id);
    const vehicle = await updateVehicle(vehicleId, req.body);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};

export const deleteVehicleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicleId = Number(req.params.id);
    await deleteVehicle(vehicleId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
