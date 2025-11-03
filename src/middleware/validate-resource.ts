import { AnyZodObject } from "zod";
import { RequestHandler } from "express";
import createHttpError from "http-errors";

export const validateResource =
  (schema: AnyZodObject): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const formatted = result.error.format();
      return next(
        createHttpError(400, "Validation failed", { cause: formatted }),
      );
    }

    Object.assign(req, result.data);

    return next();
  };
