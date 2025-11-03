"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRouter = void 0;
const express_1 = require("express");
const inventory_controller_1 = require("./inventory.controller");
const validate_resource_1 = require("../../middleware/validate-resource");
const inventory_schema_1 = require("./inventory.schema");
const router = (0, express_1.Router)();
router.get("/", inventory_controller_1.getInventoryItemsHandler);
router.get("/:id", (0, validate_resource_1.validateResource)(inventory_schema_1.getInventoryItemSchema), inventory_controller_1.getInventoryItemHandler);
router.post("/", (0, validate_resource_1.validateResource)(inventory_schema_1.createInventoryItemSchema), inventory_controller_1.createInventoryItemHandler);
router.put("/:id", (0, validate_resource_1.validateResource)(inventory_schema_1.updateInventoryItemSchema), inventory_controller_1.updateInventoryItemHandler);
router.delete("/:id", (0, validate_resource_1.validateResource)(inventory_schema_1.getInventoryItemSchema), inventory_controller_1.deleteInventoryItemHandler);
exports.inventoryRouter = router;
//# sourceMappingURL=inventory.router.js.map