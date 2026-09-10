import { PrismaClient } from "@prisma/client";
import { getEnv } from "./env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma() {
  try {
    let databaseUrl: string | undefined;
    try {
      databaseUrl = getEnv().DATABASE_URL;
    } catch {
      databaseUrl = process.env.DATABASE_URL;
    }
    if (!databaseUrl) return null;
    if (!globalForPrisma.prisma) globalForPrisma.prisma = new PrismaClient();
    return globalForPrisma.prisma;
  } catch (error) {
    console.warn("[getPrisma] Database connection initialization skipped/failed:", error);
    return null;
  }
}
