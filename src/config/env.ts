import { config } from "dotenv";
import { z } from "zod";

config();

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .default("4000")
    .transform((value) => parseInt(value, 10))
    .pipe(z.number().int().positive()),
  DATABASE_URL: z
    .string()
    .min(1)
    .refine(
      (value) =>
        value.startsWith("file:") ||
        value.startsWith("postgresql://") ||
        value.startsWith("mysql://") ||
        value.startsWith("sqlserver://"),
      "DATABASE_URL must be a valid connection string",
    ),
});

const parsed = schema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT ?? "4000",
  DATABASE_URL: process.env.DATABASE_URL,
});

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    "Environment configuration validation failed",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
