import { Router } from "express";

import { getDashboardSummaryHandler } from "./dashboard.controller";

const router = Router();

router.get("/summary", getDashboardSummaryHandler);

export const dashboardRouter = router;
