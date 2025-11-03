import { Router } from "express";

import {
  createInventoryItemHandler,
  deleteInventoryItemHandler,
  getInventoryItemHandler,
  getInventoryItemsHandler,
  updateInventoryItemHandler,
} from "./inventory.controller";
import { validateResource } from "../../middleware/validate-resource";
import {
  createInventoryItemSchema,
  getInventoryItemSchema,
  updateInventoryItemSchema,
} from "./inventory.schema";

const router = Router();

router.get("/", getInventoryItemsHandler);
router.get(
  "/:id",
  validateResource(getInventoryItemSchema),
  getInventoryItemHandler,
);
router.post(
  "/",
  validateResource(createInventoryItemSchema),
  createInventoryItemHandler,
);
router.put(
  "/:id",
  validateResource(updateInventoryItemSchema),
  updateInventoryItemHandler,
);
router.delete(
  "/:id",
  validateResource(getInventoryItemSchema),
  deleteInventoryItemHandler,
);

export const inventoryRouter = router;
