"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandlerMiddleware = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const logger_1 = require("../lib/logger");
const errorHandlerMiddleware = (err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    const error = http_errors_1.default.isHttpError(err)
        ? err
        : (0, http_errors_1.default)(500, "Internal Server Error", { cause: err });
    const statusCode = error.status ?? 500;
    const message = error.expose ? error.message : "Internal Server Error";
    logger_1.logger.error({
        statusCode,
        message,
        stack: error.stack,
        cause: error.cause,
    }, "Request failed");
    const responseBody = {
        message,
    };
    if (error.cause instanceof Error && error.cause.message) {
        responseBody.details = error.cause.message;
    }
    res.status(statusCode).json(responseBody);
};
exports.errorHandlerMiddleware = errorHandlerMiddleware;
//# sourceMappingURL=error-handler.js.map