"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsightsHandler = void 0;
const insights_service_1 = require("./insights.service");
const getInsightsHandler = async (_req, res, next) => {
    try {
        const summary = await (0, insights_service_1.getInsightsSummary)();
        res.json(summary);
    }
    catch (error) {
        next(error);
    }
};
exports.getInsightsHandler = getInsightsHandler;
//# sourceMappingURL=insights.controller.js.map