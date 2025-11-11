import { Router } from "express";

import {
  createMetadataHandler,
  deleteMetadataHandler,
  getMetadataCollectionHandler,
  getMetadataHandler,
  updateMetadataHandler,
} from "./metadata.controller";
import { validateResource } from "../../middleware/validate-resource";
import {
  createMetadataSchema,
  getMetadataSchema,
  updateMetadataSchema,
} from "./metadata.schema";

const router = Router();

router.get("/", getMetadataCollectionHandler);
router.post("/", validateResource(createMetadataSchema), createMetadataHandler);
router.get(
  "/:vehicleId",
  validateResource(getMetadataSchema),
  getMetadataHandler,
);
router.put(
  "/:vehicleId",
  validateResource(updateMetadataSchema),
  updateMetadataHandler,
);
router.delete(
  "/:vehicleId",
  validateResource(getMetadataSchema),
  deleteMetadataHandler,
);

export const metadataRouter = router;
