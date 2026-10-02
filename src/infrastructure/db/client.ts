import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes } from "node:crypto";

import { env } from "@/config/env";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const localPrismaDev = env.DATABASE_URL.includes("localhost:51214");
  const statementPrefix = randomBytes(6).toString("hex");
  let statementCounter = 0;
  const adapter = new PrismaPg(
    { connectionString: env.DATABASE_URL },
    localPrismaDev
      ? {
          // Prisma Dev's PGlite proxy shares prepared-statement state between
          // logical connections. Unique local names prevent protocol collisions.
          statementNameGenerator: () =>
            `ferraro_${statementPrefix}_${statementCounter++}`,
        }
      : undefined,
  );
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
