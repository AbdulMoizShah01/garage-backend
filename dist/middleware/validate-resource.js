"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResource = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const validateResource = (schema) => (req, _res, next) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    });
    if (!result.success) {
        const formatted = result.error.format();
        return next((0, http_errors_1.default)(400, "Validation failed", { cause: formatted }));
    }
    Object.assign(req, result.data);
    return next();
};
exports.validateResource = validateResource;
//# sourceMappingURL=validate-resource.js.map