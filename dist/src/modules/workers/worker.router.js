"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerRouter = void 0;
const express_1 = require("express");
const worker_controller_1 = require("./worker.controller");
const validate_resource_1 = require("../../middleware/validate-resource");
const worker_schema_1 = require("./worker.schema");
const router = (0, express_1.Router)();
router.get("/", worker_controller_1.getWorkersHandler);
router.post("/", (0, validate_resource_1.validateResource)(worker_schema_1.createWorkerSchema), worker_controller_1.createWorkerHandler);
router.get("/:id", (0, validate_resource_1.validateResource)(worker_schema_1.getWorkerSchema), worker_controller_1.getWorkerHandler);
router.put("/:id", (0, validate_resource_1.validateResource)(worker_schema_1.updateWorkerSchema), worker_controller_1.updateWorkerHandler);
router.delete("/:id", (0, validate_resource_1.validateResource)(worker_schema_1.getWorkerSchema), worker_controller_1.deleteWorkerHandler);
exports.workerRouter = router;
//# sourceMappingURL=worker.router.js.map