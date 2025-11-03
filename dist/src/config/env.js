"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)();
const schema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: zod_1.z
        .string()
        .default("4000")
        .transform((value) => parseInt(value, 10))
        .pipe(zod_1.z.number().int().positive()),
    DATABASE_URL: zod_1.z
        .string()
        .min(1)
        .refine((value) => value.startsWith("file:") ||
        value.startsWith("postgresql://") ||
        value.startsWith("mysql://") ||
        value.startsWith("sqlserver://"), "DATABASE_URL must be a valid connection string"),
});
const parsed = schema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT ?? "4000",
    DATABASE_URL: process.env.DATABASE_URL,
});
if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("Environment configuration validation failed", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map