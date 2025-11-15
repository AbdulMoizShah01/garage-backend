"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spendingRouter = void 0;
const express_1 = require("express");
const spending_controller_1 = require("./spending.controller");
const validate_resource_1 = require("../../middleware/validate-resource");
const spending_schema_1 = require("./spending.schema");
const router = (0, express_1.Router)();
router.get("/", spending_controller_1.getSpendingsHandler);
router.get("/:id", (0, validate_resource_1.validateResource)(spending_schema_1.getSpendingSchema), spending_controller_1.getSpendingHandler);
router.post("/", (0, validate_resource_1.validateResource)(spending_schema_1.createSpendingSchema), spending_controller_1.createSpendingHandler);
router.put("/:id", (0, validate_resource_1.validateResource)(spending_schema_1.updateSpendingSchema), spending_controller_1.updateSpendingHandler);
router.delete("/:id", (0, validate_resource_1.validateResource)(spending_schema_1.getSpendingSchema), spending_controller_1.deleteSpendingHandler);
exports.spendingRouter = router;
//# sourceMappingURL=spending.router.js.map