import { PrismaClient } from "@prisma/client";

import { env } from "../config/env";
import { logger } from "./logger";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaBeforeExitHookRegistered: boolean | undefined;
}

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  return client;
};

export const prisma = global.prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

if (!global.prismaBeforeExitHookRegistered) {
  process.once("beforeExit", async () => {
    if (env.NODE_ENV !== "test") {
      logger.info("Prisma client disconnecting");
    }

    await prisma.$disconnect();
  });

  global.prismaBeforeExitHookRegistered = true;
}
