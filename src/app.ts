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
  const allowedOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Allow origins from the CORS_ORIGINS env var and any Vercel preview/production domains
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow non-browser requests (e.g. curl, server-to-server) with no origin
      if (!origin) return callback(null, true);

      if (env.NODE_ENV === "development") return callback(null, true);

      const isExplicit = allowedOrigins.includes(origin);
      const isVercel = /(^https?:\/\/[^\s]+\.vercel\.app(:\d+)?$)/i.test(origin);

      return callback(null, isExplicit || isVercel);
    },
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
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
