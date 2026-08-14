import { PrismaClient } from "@prisma/client";
import { getEnv } from "./env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma() {
  if (!getEnv().DATABASE_URL) return null;
  if (!globalForPrisma.prisma) globalForPrisma.prisma = new PrismaClient();
  return globalForPrisma.prisma;
}
