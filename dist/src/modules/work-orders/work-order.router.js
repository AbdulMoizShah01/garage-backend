"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workOrderRouter = void 0;
const express_1 = require("express");
const work_order_controller_1 = require("./work-order.controller");
const validate_resource_1 = require("../../middleware/validate-resource");
const work_order_schema_1 = require("./work-order.schema");
const router = (0, express_1.Router)();
router.get("/", work_order_controller_1.getWorkOrdersHandler);
router.get("/:id", (0, validate_resource_1.validateResource)(work_order_schema_1.getWorkOrderSchema), work_order_controller_1.getWorkOrderHandler);
router.post("/", (0, validate_resource_1.validateResource)(work_order_schema_1.createWorkOrderSchema), work_order_controller_1.createWorkOrderHandler);
router.put("/:id", (0, validate_resource_1.validateResource)(work_order_schema_1.updateWorkOrderSchema), work_order_controller_1.updateWorkOrderHandler);
router.post("/:id/complete", (0, validate_resource_1.validateResource)(work_order_schema_1.getWorkOrderSchema), work_order_controller_1.completeWorkOrderHandler);
router.delete("/:id", (0, validate_resource_1.validateResource)(work_order_schema_1.getWorkOrderSchema), work_order_controller_1.deleteWorkOrderHandler);
exports.workOrderRouter = router;
//# sourceMappingURL=work-order.router.js.map