"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = void 0;
const notFoundMiddleware = (_req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    res.status(404).json({
        message: "Resource not found",
    });
};
exports.notFoundMiddleware = notFoundMiddleware;
//# sourceMappingURL=not-found.js.map