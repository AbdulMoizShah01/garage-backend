"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadWorkOrderInvoiceHandler = exports.completeWorkOrderHandler = exports.deleteWorkOrderHandler = exports.updateWorkOrderHandler = exports.createWorkOrderHandler = exports.getWorkOrderHandler = exports.getWorkOrdersHandler = void 0;
const work_order_service_1 = require("./work-order.service");
const work_order_invoice_1 = require("./work-order.invoice");
const work_order_schema_1 = require("./work-order.schema");
const parseDate = (value) => {
    if (!value) {
        return undefined;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};
const parseBoolean = (value) => {
    if (!value) {
        return undefined;
    }
    const normalized = value.toLowerCase();
    if (normalized === "true") {
        return true;
    }
    if (normalized === "false") {
        return false;
    }
    return undefined;
};
const getWorkOrdersHandler = async (req, res, next) => {
    try {
        const statusQuery = typeof req.query.status === "string"
            ? req.query.status.toUpperCase()
            : undefined;
        const allowedStatuses = new Set([...work_order_schema_1.WORK_ORDER_STATUSES, "ALL"]);
        const status = statusQuery && allowedStatuses.has(statusQuery)
            ? statusQuery
            : undefined;
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        const from = typeof req.query.from === "string"
            ? parseDate(req.query.from)
            : undefined;
        const to = typeof req.query.to === "string" ? parseDate(req.query.to) : undefined;
        const historical = typeof req.query.historical === "string"
            ? parseBoolean(req.query.historical)
            : undefined;
        const workOrders = await (0, work_order_service_1.listWorkOrders)({
            status,
            search,
            from,
            to,
            historical,
        });
        res.json(workOrders);
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkOrdersHandler = getWorkOrdersHandler;
const getWorkOrderHandler = async (req, res, next) => {
    try {
        const workOrderId = Number(req.params.id);
        const workOrder = await (0, work_order_service_1.getWorkOrderById)(workOrderId);
        res.json(workOrder);
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkOrderHandler = getWorkOrderHandler;
const createWorkOrderHandler = async (req, res, next) => {
    try {
        const workOrder = await (0, work_order_service_1.createWorkOrder)(req.body);
        res.status(201).json(workOrder);
    }
    catch (error) {
        next(error);
    }
};
exports.createWorkOrderHandler = createWorkOrderHandler;
const updateWorkOrderHandler = async (req, res, next) => {
    try {
        const workOrderId = Number(req.params.id);
        const workOrder = await (0, work_order_service_1.updateWorkOrder)(workOrderId, req.body);
        res.json(workOrder);
    }
    catch (error) {
        next(error);
    }
};
exports.updateWorkOrderHandler = updateWorkOrderHandler;
const deleteWorkOrderHandler = async (req, res, next) => {
    try {
        const workOrderId = Number(req.params.id);
        await (0, work_order_service_1.deleteWorkOrder)(workOrderId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteWorkOrderHandler = deleteWorkOrderHandler;
const completeWorkOrderHandler = async (req, res, next) => {
    try {
        const workOrderId = Number(req.params.id);
        const workOrder = await (0, work_order_service_1.completeWorkOrder)(workOrderId);
        res.json(workOrder);
    }
    catch (error) {
        next(error);
    }
};
exports.completeWorkOrderHandler = completeWorkOrderHandler;
const downloadWorkOrderInvoiceHandler = async (req, res, next) => {
    try {
        const workOrderId = Number(req.params.id);
        const workOrder = await (0, work_order_service_1.getWorkOrderById)(workOrderId);
        const pdf = await (0, work_order_invoice_1.createInvoicePdf)(workOrder);
        const invoiceCode = (0, work_order_invoice_1.buildInvoiceCode)(workOrder).replace(/\//g, "-");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${invoiceCode}.pdf"`);
        res.send(pdf);
    }
    catch (error) {
        next(error);
    }
};
exports.downloadWorkOrderInvoiceHandler = downloadWorkOrderInvoiceHandler;
//# sourceMappingURL=work-order.controller.js.map