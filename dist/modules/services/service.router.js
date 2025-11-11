"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceCatalogRouter = void 0;
const express_1 = require("express");
const service_controller_1 = require("./service.controller");
const validate_resource_1 = require("../../middleware/validate-resource");
const service_schema_1 = require("./service.schema");
const router = (0, express_1.Router)();
router.get("/", service_controller_1.getServiceItemsHandler);
router.post("/", (0, validate_resource_1.validateResource)(service_schema_1.createServiceItemSchema), service_controller_1.createServiceItemHandler);
router.get("/:id", (0, validate_resource_1.validateResource)(service_schema_1.getServiceItemSchema), service_controller_1.getServiceItemHandler);
router.put("/:id", (0, validate_resource_1.validateResource)(service_schema_1.updateServiceItemSchema), service_controller_1.updateServiceItemHandler);
router.delete("/:id", (0, validate_resource_1.validateResource)(service_schema_1.getServiceItemSchema), service_controller_1.deleteServiceItemHandler);
exports.serviceCatalogRouter = router;
//# sourceMappingURL=service.router.js.map