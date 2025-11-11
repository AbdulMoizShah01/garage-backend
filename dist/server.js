"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const app_1 = require("./app");
const logger_1 = require("./lib/logger");
const app = (0, app_1.createApp)();
const server = app.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`API server listening on port ${env_1.env.PORT}`);
});
const shutdown = (signal) => {
    logger_1.logger.info({ signal }, "Graceful shutdown initiated");
    server.close(() => {
        logger_1.logger.info("HTTP server closed");
        process.exit(0);
    });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
//# sourceMappingURL=server.js.map