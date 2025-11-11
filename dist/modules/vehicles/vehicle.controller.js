"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicleHandler = exports.updateVehicleHandler = exports.createVehicleHandler = exports.getVehicleHandler = exports.getVehiclesHandler = void 0;
const vehicle_service_1 = require("./vehicle.service");
const getVehiclesHandler = async (_req, res, next) => {
    try {
        const vehicles = await (0, vehicle_service_1.listVehicles)();
        res.json(vehicles);
    }
    catch (error) {
        next(error);
    }
};
exports.getVehiclesHandler = getVehiclesHandler;
const getVehicleHandler = async (req, res, next) => {
    try {
        const vehicleId = Number(req.params.id);
        const vehicle = await (0, vehicle_service_1.getVehicleById)(vehicleId);
        res.json(vehicle);
    }
    catch (error) {
        next(error);
    }
};
exports.getVehicleHandler = getVehicleHandler;
const createVehicleHandler = async (req, res, next) => {
    try {
        const vehicle = await (0, vehicle_service_1.createVehicle)(req.body);
        res.status(201).json(vehicle);
    }
    catch (error) {
        next(error);
    }
};
exports.createVehicleHandler = createVehicleHandler;
const updateVehicleHandler = async (req, res, next) => {
    try {
        const vehicleId = Number(req.params.id);
        const vehicle = await (0, vehicle_service_1.updateVehicle)(vehicleId, req.body);
        res.json(vehicle);
    }
    catch (error) {
        next(error);
    }
};
exports.updateVehicleHandler = updateVehicleHandler;
const deleteVehicleHandler = async (req, res, next) => {
    try {
        const vehicleId = Number(req.params.id);
        await (0, vehicle_service_1.deleteVehicle)(vehicleId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteVehicleHandler = deleteVehicleHandler;
//# sourceMappingURL=vehicle.controller.js.map