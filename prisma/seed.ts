import { PrismaClient } from "@prisma/client";
import { bootstrapDevelopment } from "../scripts/dev-bootstrap";

const prisma = new PrismaClient();

bootstrapDevelopment(prisma)
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Development bootstrap failed.");
    process.exitCode = 1;
  });
