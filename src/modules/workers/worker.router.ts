import { Router } from "express";

import {
  createWorkerHandler,
  deleteWorkerHandler,
  getWorkerHandler,
  getWorkersHandler,
  updateWorkerHandler,
  updateWorkerSalaryStatusHandler,
} from "./worker.controller";
import { validateResource } from "../../middleware/validate-resource";
import {
  createWorkerSchema,
  getWorkerSchema,
  updateWorkerSchema,
  updateWorkerSalaryStatusSchema,
} from "./worker.schema";

const router = Router();

router.get("/", getWorkersHandler);
router.post("/", validateResource(createWorkerSchema), createWorkerHandler);
router.get("/:id", validateResource(getWorkerSchema), getWorkerHandler);
router.put("/:id", validateResource(updateWorkerSchema), updateWorkerHandler);
router.delete("/:id", validateResource(getWorkerSchema), deleteWorkerHandler);
router.post(
  "/:id/salary-status",
  validateResource(updateWorkerSalaryStatusSchema),
  updateWorkerSalaryStatusHandler,
);

export const workerRouter = router;
