"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpendingHandler = exports.updateSpendingHandler = exports.createSpendingHandler = exports.getSpendingHandler = exports.getSpendingsHandler = void 0;
const spending_service_1 = require("./spending.service");
const parseDate = (value) => {
    if (!value) {
        return undefined;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};
const getSpendingsHandler = async (req, res, next) => {
    try {
        const filters = {
            category: typeof req.query.category === "string" ? req.query.category : undefined,
            search: typeof req.query.search === "string" ? req.query.search : undefined,
            from: typeof req.query.from === "string" ? parseDate(req.query.from) : undefined,
            to: typeof req.query.to === "string" ? parseDate(req.query.to) : undefined,
        };
        const spendings = await (0, spending_service_1.listSpendings)(filters);
        res.json(spendings);
    }
    catch (error) {
        next(error);
    }
};
exports.getSpendingsHandler = getSpendingsHandler;
const getSpendingHandler = async (req, res, next) => {
    try {
        const spendingId = Number(req.params.id);
        const spending = await (0, spending_service_1.getSpendingById)(spendingId);
        res.json(spending);
    }
    catch (error) {
        next(error);
    }
};
exports.getSpendingHandler = getSpendingHandler;
const createSpendingHandler = async (req, res, next) => {
    try {
        const spending = await (0, spending_service_1.createSpending)(req.body);
        res.status(201).json(spending);
    }
    catch (error) {
        next(error);
    }
};
exports.createSpendingHandler = createSpendingHandler;
const updateSpendingHandler = async (req, res, next) => {
    try {
        const spendingId = Number(req.params.id);
        const spending = await (0, spending_service_1.updateSpending)(spendingId, req.body);
        res.json(spending);
    }
    catch (error) {
        next(error);
    }
};
exports.updateSpendingHandler = updateSpendingHandler;
const deleteSpendingHandler = async (req, res, next) => {
    try {
        const spendingId = Number(req.params.id);
        await (0, spending_service_1.deleteSpending)(spendingId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSpendingHandler = deleteSpendingHandler;
//# sourceMappingURL=spending.controller.js.map