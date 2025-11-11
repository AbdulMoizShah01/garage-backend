import { Router } from "express";

import { getInsightsHandler } from "./insights.controller";

const router = Router();

router.get("/summary", getInsightsHandler);

export const insightsRouter = router;
