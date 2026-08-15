import "server-only";

import { Prisma, type PrismaClient } from "@prisma/client";

export type SerializableClient = Prisma.TransactionClient;

export async function withSerializable<T>(
  prisma: PrismaClient,
  callback: (tx: SerializableClient) => Promise<T>,
  retries = 3,
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await prisma.$transaction(callback, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034" || attempt === retries - 1) throw error;
    }
  }
  throw new Error("Serializable transaction failed");
}
