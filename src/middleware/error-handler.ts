import createHttpError from "http-errors";
import { ErrorRequestHandler } from "express";

import { logger } from "../lib/logger";

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err,
  _req,
  res,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next,
) => {
  const error = createHttpError.isHttpError(err)
    ? err
    : createHttpError(500, "Internal Server Error", { cause: err });

  const statusCode = error.status ?? 500;
  const message = error.expose ? error.message : "Internal Server Error";

  logger.error(
    {
      statusCode,
      message,
      stack: error.stack,
      cause: error.cause,
    },
    "Request failed",
  );

  const responseBody: Record<string, unknown> = {
    message,
  };

  if (error.cause instanceof Error && error.cause.message) {
    responseBody.details = error.cause.message;
  }

  res.status(statusCode).json(responseBody);
};
