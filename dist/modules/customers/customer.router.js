"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRouter = void 0;
const express_1 = require("express");
const customer_controller_1 = require("./customer.controller");
const validate_resource_1 = require("../../middleware/validate-resource");
const customer_schema_1 = require("./customer.schema");
const router = (0, express_1.Router)();
router.get("/", customer_controller_1.getCustomersHandler);
router.get("/:id", (0, validate_resource_1.validateResource)(customer_schema_1.getCustomerSchema), customer_controller_1.getCustomerHandler);
router.post("/", (0, validate_resource_1.validateResource)(customer_schema_1.createCustomerSchema), customer_controller_1.createCustomerHandler);
router.put("/:id", (0, validate_resource_1.validateResource)(customer_schema_1.updateCustomerSchema), customer_controller_1.updateCustomerHandler);
router.delete("/:id", (0, validate_resource_1.validateResource)(customer_schema_1.getCustomerSchema), customer_controller_1.deleteCustomerHandler);
exports.customerRouter = router;
//# sourceMappingURL=customer.router.js.map