"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMetadataHandler = exports.updateMetadataHandler = exports.getMetadataHandler = exports.createMetadataHandler = exports.getMetadataCollectionHandler = void 0;
const metadata_service_1 = require("./metadata.service");
const getMetadataCollectionHandler = async (req, res, next) => {
    try {
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        const records = await (0, metadata_service_1.listMetadata)(search);
        res.json(records);
    }
    catch (error) {
        next(error);
    }
};
exports.getMetadataCollectionHandler = getMetadataCollectionHandler;
const createMetadataHandler = async (req, res, next) => {
    try {
        const record = await (0, metadata_service_1.createMetadata)(req.body);
        res.status(201).json(record);
    }
    catch (error) {
        next(error);
    }
};
exports.createMetadataHandler = createMetadataHandler;
const getMetadataHandler = async (req, res, next) => {
    try {
        const vehicleId = Number(req.params.vehicleId);
        const record = await (0, metadata_service_1.getMetadataByVehicleId)(vehicleId);
        res.json(record);
    }
    catch (error) {
        next(error);
    }
};
exports.getMetadataHandler = getMetadataHandler;
const updateMetadataHandler = async (req, res, next) => {
    try {
        const vehicleId = Number(req.params.vehicleId);
        const record = await (0, metadata_service_1.updateMetadata)(vehicleId, req.body);
        res.json(record);
    }
    catch (error) {
        next(error);
    }
};
exports.updateMetadataHandler = updateMetadataHandler;
const deleteMetadataHandler = async (req, res, next) => {
    try {
        const vehicleId = Number(req.params.vehicleId);
        await (0, metadata_service_1.deleteMetadata)(vehicleId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMetadataHandler = deleteMetadataHandler;
//# sourceMappingURL=metadata.controller.js.map