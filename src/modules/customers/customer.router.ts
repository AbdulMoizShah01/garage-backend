import { Router } from "express";

import {
  createCustomerHandler,
  getCustomerHandler,
  getCustomersHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
} from "./customer.controller";
import { validateResource } from "../../middleware/validate-resource";
import {
  createCustomerSchema,
  getCustomerSchema,
  updateCustomerSchema,
} from "./customer.schema";

const router = Router();

router.get("/", getCustomersHandler);
router.get("/:id", validateResource(getCustomerSchema), getCustomerHandler);
router.post("/", validateResource(createCustomerSchema), createCustomerHandler);
router.put(
  "/:id",
  validateResource(updateCustomerSchema),
  updateCustomerHandler,
);
router.delete(
  "/:id",
  validateResource(getCustomerSchema),
  deleteCustomerHandler,
);

export const customerRouter = router;
