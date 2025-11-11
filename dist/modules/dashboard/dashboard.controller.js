"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummaryHandler = void 0;
const dashboard_service_1 = require("./dashboard.service");
const getDashboardSummaryHandler = async (_req, res, next) => {
    try {
        const summary = await (0, dashboard_service_1.getDashboardSummary)();
        res.json(summary);
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardSummaryHandler = getDashboardSummaryHandler;
//# sourceMappingURL=dashboard.controller.js.map