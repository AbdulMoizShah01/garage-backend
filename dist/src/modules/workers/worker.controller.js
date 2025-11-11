"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkerSalaryStatusHandler = exports.deleteWorkerHandler = exports.updateWorkerHandler = exports.createWorkerHandler = exports.getWorkerHandler = exports.getWorkersHandler = void 0;
const worker_service_1 = require("./worker.service");
const getWorkersHandler = async (req, res, next) => {
    try {
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        const workers = await (0, worker_service_1.listWorkers)(search);
        res.json(workers);
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkersHandler = getWorkersHandler;
const getWorkerHandler = async (req, res, next) => {
    try {
        const workerId = Number(req.params.id);
        const worker = await (0, worker_service_1.getWorkerById)(workerId);
        res.json(worker);
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkerHandler = getWorkerHandler;
const createWorkerHandler = async (req, res, next) => {
    try {
        const worker = await (0, worker_service_1.createWorker)(req.body);
        res.status(201).json(worker);
    }
    catch (error) {
        next(error);
    }
};
exports.createWorkerHandler = createWorkerHandler;
const updateWorkerHandler = async (req, res, next) => {
    try {
        const workerId = Number(req.params.id);
        const worker = await (0, worker_service_1.updateWorker)(workerId, req.body);
        res.json(worker);
    }
    catch (error) {
        next(error);
    }
};
exports.updateWorkerHandler = updateWorkerHandler;
const deleteWorkerHandler = async (req, res, next) => {
    try {
        const workerId = Number(req.params.id);
        await (0, worker_service_1.deleteWorker)(workerId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteWorkerHandler = deleteWorkerHandler;
const updateWorkerSalaryStatusHandler = async (req, res, next) => {
    try {
        const workerId = Number(req.params.id);
        const { markAs, paidAt } = req.body;
        const worker = await (0, worker_service_1.updateWorkerSalaryStatus)(workerId, markAs, paidAt);
        res.json(worker);
    }
    catch (error) {
        next(error);
    }
};
exports.updateWorkerSalaryStatusHandler = updateWorkerSalaryStatusHandler;
//# sourceMappingURL=worker.controller.js.map