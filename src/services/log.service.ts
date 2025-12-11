import { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class LogService {
	async logAction(params: {
		tenantId?: string;
		userId: string;
		action: string;
		entityType: string;
		entityId: string;
	}) {
		try {
			await prisma.log.create({
				data: {
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
