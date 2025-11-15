import { PrismaClient } from "@prisma/client";

export async function getTenantFromToken(token: string | undefined) {
	if (!token) return null;
	const prisma = new PrismaClient();
	// find token in DB with user relation
	const stored = await prisma.accessToken.findUnique({
		where: { token },
		include: { user: true },
	});

	if (!stored || !stored.user) return null;

	return {
		tenantId: stored.user.tenantId,
	};
}
