"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insightsRouter = void 0;
const express_1 = require("express");
const insights_controller_1 = require("./insights.controller");
const router = (0, express_1.Router)();
router.get("/summary", insights_controller_1.getInsightsHandler);
exports.insightsRouter = router;
//# sourceMappingURL=insights.router.js.map