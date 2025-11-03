import { Router } from "express";

import {
  createWorkOrderHandler,
  deleteWorkOrderHandler,
  getWorkOrderHandler,
  getWorkOrdersHandler,
  updateWorkOrderHandler,
  completeWorkOrderHandler,
} from "./work-order.controller";
import { validateResource } from "../../middleware/validate-resource";
import {
  createWorkOrderSchema,
  getWorkOrderSchema,
  updateWorkOrderSchema,
} from "./work-order.schema";

const router = Router();

router.get("/", getWorkOrdersHandler);
router.get("/:id", validateResource(getWorkOrderSchema), getWorkOrderHandler);
router.post(
  "/",
  validateResource(createWorkOrderSchema),
  createWorkOrderHandler,
);
router.put(
  "/:id",
  validateResource(updateWorkOrderSchema),
  updateWorkOrderHandler,
);
router.post(
  "/:id/complete",
  validateResource(getWorkOrderSchema),
  completeWorkOrderHandler,
);
router.delete(
  "/:id",
  validateResource(getWorkOrderSchema),
  deleteWorkOrderHandler,
);

export const workOrderRouter = router;
