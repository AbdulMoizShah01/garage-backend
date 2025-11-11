"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const logger_1 = require("./logger");
const prismaClientSingleton = () => {
    const client = new client_1.PrismaClient({
        log: env_1.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
    return client;
};
exports.prisma = global.prisma ?? prismaClientSingleton();
if (env_1.env.NODE_ENV !== "production") {
    global.prisma = exports.prisma;
}
if (!global.prismaBeforeExitHookRegistered) {
    process.once("beforeExit", async () => {
        if (env_1.env.NODE_ENV !== "test") {
            logger_1.logger.info("Prisma client disconnecting");
        }
        await exports.prisma.$disconnect();
    });
    global.prismaBeforeExitHookRegistered = true;
}
//# sourceMappingURL=prisma.js.map