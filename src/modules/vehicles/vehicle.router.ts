import { Router } from "express";

import {
  createVehicleHandler,
  deleteVehicleHandler,
  getVehicleHandler,
  getVehiclesHandler,
  updateVehicleHandler,
} from "./vehicle.controller";
import { validateResource } from "../../middleware/validate-resource";
import {
  createVehicleSchema,
  getVehicleSchema,
  updateVehicleSchema,
} from "./vehicle.schema";

const router = Router();

router.get("/", getVehiclesHandler);
router.get("/:id", validateResource(getVehicleSchema), getVehicleHandler);
router.post("/", validateResource(createVehicleSchema), createVehicleHandler);
router.put("/:id", validateResource(updateVehicleSchema), updateVehicleHandler);
router.delete("/:id", validateResource(getVehicleSchema), deleteVehicleHandler);

export const vehicleRouter = router;
