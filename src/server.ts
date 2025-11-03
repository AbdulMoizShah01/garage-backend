import { env } from "./config/env";
import { createApp } from "./app";
import { logger } from "./lib/logger";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API server listening on port ${env.PORT}`);
});

const shutdown = (signal: string) => {
  logger.info({ signal }, "Graceful shutdown initiated");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
