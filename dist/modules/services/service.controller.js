"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteServiceItemHandler = exports.updateServiceItemHandler = exports.createServiceItemHandler = exports.getServiceItemHandler = exports.getServiceItemsHandler = void 0;
const service_service_1 = require("./service.service");
const getServiceItemsHandler = async (req, res, next) => {
    try {
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        const items = await (0, service_service_1.listServiceItems)(search);
        res.json(items);
    }
    catch (error) {
        next(error);
    }
};
exports.getServiceItemsHandler = getServiceItemsHandler;
const getServiceItemHandler = async (req, res, next) => {
    try {
        const itemId = Number(req.params.id);
        const item = await (0, service_service_1.getServiceItemById)(itemId);
        res.json(item);
    }
    catch (error) {
        next(error);
    }
};
exports.getServiceItemHandler = getServiceItemHandler;
const createServiceItemHandler = async (req, res, next) => {
    try {
        const item = await (0, service_service_1.createServiceItem)(req.body);
        res.status(201).json(item);
    }
    catch (error) {
        next(error);
    }
};
exports.createServiceItemHandler = createServiceItemHandler;
const updateServiceItemHandler = async (req, res, next) => {
    try {
        const itemId = Number(req.params.id);
        const item = await (0, service_service_1.updateServiceItem)(itemId, req.body);
        res.json(item);
    }
    catch (error) {
        next(error);
    }
};
exports.updateServiceItemHandler = updateServiceItemHandler;
const deleteServiceItemHandler = async (req, res, next) => {
    try {
        const itemId = Number(req.params.id);
        await (0, service_service_1.deleteServiceItem)(itemId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteServiceItemHandler = deleteServiceItemHandler;
//# sourceMappingURL=service.controller.js.map