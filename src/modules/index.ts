import { Router } from "express";

import { customerRouter } from "./customers/customer.router";
import { vehicleRouter } from "./vehicles/vehicle.router";
import { workOrderRouter } from "./work-orders/work-order.router";
import { inventoryRouter } from "./inventory/inventory.router";
import { serviceCatalogRouter } from "./services/service.router";
import { workerRouter } from "./workers/worker.router";
import { dashboardRouter } from "./dashboard/dashboard.router";
import { metadataRouter } from "./metadata/metadata.router";
import { insightsRouter } from "./insights/insights.router";

const router = Router();

router.use("/customers", customerRouter);
router.use("/vehicles", vehicleRouter);
router.use("/work-orders", workOrderRouter);
router.use("/inventory", inventoryRouter);
router.use("/services", serviceCatalogRouter);
router.use("/workers", workerRouter);
router.use("/dashboard", dashboardRouter);
router.use("/metadata", metadataRouter);
router.use("/insights", insightsRouter);

export const apiRouter = router;
