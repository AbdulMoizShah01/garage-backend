"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataRouter = void 0;
const express_1 = require("express");
const metadata_controller_1 = require("./metadata.controller");
const validate_resource_1 = require("../../middleware/validate-resource");
const metadata_schema_1 = require("./metadata.schema");
const router = (0, express_1.Router)();
router.get("/", metadata_controller_1.getMetadataCollectionHandler);
router.post("/", (0, validate_resource_1.validateResource)(metadata_schema_1.createMetadataSchema), metadata_controller_1.createMetadataHandler);
router.get("/:vehicleId", (0, validate_resource_1.validateResource)(metadata_schema_1.getMetadataSchema), metadata_controller_1.getMetadataHandler);
router.put("/:vehicleId", (0, validate_resource_1.validateResource)(metadata_schema_1.updateMetadataSchema), metadata_controller_1.updateMetadataHandler);
router.delete("/:vehicleId", (0, validate_resource_1.validateResource)(metadata_schema_1.getMetadataSchema), metadata_controller_1.deleteMetadataHandler);
exports.metadataRouter = router;
//# sourceMappingURL=metadata.router.js.map