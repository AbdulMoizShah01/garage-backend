"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleRouter = void 0;
const express_1 = require("express");
const vehicle_controller_1 = require("./vehicle.controller");
const validate_resource_1 = require("../../middleware/validate-resource");
const vehicle_schema_1 = require("./vehicle.schema");
const router = (0, express_1.Router)();
router.get("/", vehicle_controller_1.getVehiclesHandler);
router.get("/:id", (0, validate_resource_1.validateResource)(vehicle_schema_1.getVehicleSchema), vehicle_controller_1.getVehicleHandler);
router.post("/", (0, validate_resource_1.validateResource)(vehicle_schema_1.createVehicleSchema), vehicle_controller_1.createVehicleHandler);
router.put("/:id", (0, validate_resource_1.validateResource)(vehicle_schema_1.updateVehicleSchema), vehicle_controller_1.updateVehicleHandler);
router.delete("/:id", (0, validate_resource_1.validateResource)(vehicle_schema_1.getVehicleSchema), vehicle_controller_1.deleteVehicleHandler);
exports.vehicleRouter = router;
//# sourceMappingURL=vehicle.router.js.map