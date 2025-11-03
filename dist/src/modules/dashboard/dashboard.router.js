"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("./dashboard.controller");
const router = (0, express_1.Router)();
router.get("/summary", dashboard_controller_1.getDashboardSummaryHandler);
exports.dashboardRouter = router;
//# sourceMappingURL=dashboard.router.js.map