import type { PrismaClient } from "@prisma/client";
import { AppError } from "../../../errors/AppError";

export const getPassengerByUserTenantId = async (
	tenantId: string,
	userId: string,
	prisma?: PrismaClient,
) => {
	if (!prisma) {
		throw new AppError("prisma Client Is required", 500);
	}
	return await prisma.passenger.findUnique({
		where: {
			tenantId_userId: {
				tenantId: tenantId,
				userId: userId,
			},
		},
	});
};
