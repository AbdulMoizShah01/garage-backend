import { Router } from "express";

import {
  createServiceItemHandler,
  deleteServiceItemHandler,
  getServiceItemHandler,
  getServiceItemsHandler,
  updateServiceItemHandler,
} from "./service.controller";
import { validateResource } from "../../middleware/validate-resource";
import {
  createServiceItemSchema,
  getServiceItemSchema,
  updateServiceItemSchema,
} from "./service.schema";

const router = Router();

router.get("/", getServiceItemsHandler);
router.post(
  "/",
  validateResource(createServiceItemSchema),
  createServiceItemHandler,
);
router.get(
  "/:id",
  validateResource(getServiceItemSchema),
  getServiceItemHandler,
);
router.put(
  "/:id",
  validateResource(updateServiceItemSchema),
  updateServiceItemHandler,
);
router.delete(
  "/:id",
  validateResource(getServiceItemSchema),
  deleteServiceItemHandler,
);

export const serviceCatalogRouter = router;
