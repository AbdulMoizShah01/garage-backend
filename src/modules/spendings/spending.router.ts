import { Router } from "express";

import {
  createSpendingHandler,
  deleteSpendingHandler,
  getSpendingHandler,
  getSpendingsHandler,
  updateSpendingHandler,
} from "./spending.controller";
import { validateResource } from "../../middleware/validate-resource";
import {
  createSpendingSchema,
  getSpendingSchema,
  updateSpendingSchema,
} from "./spending.schema";

const router = Router();

router.get("/", getSpendingsHandler);
router.get("/:id", validateResource(getSpendingSchema), getSpendingHandler);
router.post("/", validateResource(createSpendingSchema), createSpendingHandler);
router.put("/:id", validateResource(updateSpendingSchema), updateSpendingHandler);
router.delete("/:id", validateResource(getSpendingSchema), deleteSpendingHandler);

export const spendingRouter = router;
