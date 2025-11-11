import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { apiRouter } from "./modules";
import { notFoundMiddleware } from "./middleware/not-found";
import { errorHandlerMiddleware } from "./middleware/error-handler";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        // Always allow non-browser or same-origin requests (e.g., curl, server-to-server)
        if (!requestOrigin) {
          return callback(null, true);
        }
        // In development, allow any origin for convenience
        if (env.NODE_ENV === "development") {
          return callback(null, true);
        }
        // In production, allow only configured origins
        const allowed =
          (env.CORS_ORIGINS ?? "")
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);
        if (allowed.includes(requestOrigin)) {
          return callback(null, true);
        }
        return callback(new Error("CORS: Origin not allowed"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "X-Requested-With",
      ],
      optionsSuccessStatus: 204,
    }),
  );
  // Explicitly handle preflight for all routes
  app.options("*", cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    morgan(":method :url :status :response-time ms", {
      skip: () => env.NODE_ENV === "test",
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api", apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
};
