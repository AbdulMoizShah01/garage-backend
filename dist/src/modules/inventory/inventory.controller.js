"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInventoryItemHandler = exports.updateInventoryItemHandler = exports.createInventoryItemHandler = exports.getInventoryItemHandler = exports.getInventoryItemsHandler = void 0;
const inventory_service_1 = require("./inventory.service");
const getInventoryItemsHandler = async (req, res, next) => {
    try {
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        const items = await (0, inventory_service_1.listInventoryItems)(search);
        res.json(items);
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryItemsHandler = getInventoryItemsHandler;
const getInventoryItemHandler = async (req, res, next) => {
    try {
        const itemId = Number(req.params.id);
        const item = await (0, inventory_service_1.getInventoryItemById)(itemId);
        res.json(item);
    }
    catch (error) {
        next(error);
    }
};
exports.getInventoryItemHandler = getInventoryItemHandler;
const createInventoryItemHandler = async (req, res, next) => {
    try {
        const item = await (0, inventory_service_1.createInventoryItem)(req.body);
        res.status(201).json(item);
    }
    catch (error) {
        next(error);
    }
};
exports.createInventoryItemHandler = createInventoryItemHandler;
const updateInventoryItemHandler = async (req, res, next) => {
    try {
        const itemId = Number(req.params.id);
        const item = await (0, inventory_service_1.updateInventoryItem)(itemId, req.body);
        res.json(item);
    }
    catch (error) {
        next(error);
    }
};
exports.updateInventoryItemHandler = updateInventoryItemHandler;
const deleteInventoryItemHandler = async (req, res, next) => {
    try {
        const itemId = Number(req.params.id);
        await (0, inventory_service_1.deleteInventoryItem)(itemId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteInventoryItemHandler = deleteInventoryItemHandler;
//# sourceMappingURL=inventory.controller.js.map