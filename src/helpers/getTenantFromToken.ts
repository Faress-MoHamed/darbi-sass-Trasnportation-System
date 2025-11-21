import { prisma } from '../lib/prisma';

export async function getTenantFromToken(token?: string) {
  if (!token) return null;

  const stored = await prisma.accessToken.findUnique({
    where: { token },
    include: { user: true },
  });

  return stored;
}
