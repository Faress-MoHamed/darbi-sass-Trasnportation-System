import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class LogService {
  async logAction(params: {
    tenantId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
  }) {
    try {
      await prisma.log.create({
        data: {
          tenantId: params.tenantId,
          userId: params.userId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
        },
      });
    } catch (error) {
      console.error("Logging error:", error);
      // Optionally handle or ignore
    }
  }
}
