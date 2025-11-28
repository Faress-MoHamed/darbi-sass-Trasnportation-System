import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaPostgresAdapter } from "@prisma/adapter-ppg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const connectionString = `postgres://avnadmin:AVNS_-wSBsbg-x5KZud7HU9M@pg-320ef1ad-fareess-466d.k.aivencloud.com:22508/defaultdb?sslmode=verify-full&sslrootcert=certs/ca.pem`
const adapter = new PrismaPg({ connectionString })

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: ["error", "warn"],
		adapter,
	});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const PrismaForDev = (tenantId?: string, userId?: string) => {
	return prisma.$extends({
		query: {
			$allModels: {
				async findMany({ model, args, query }) {
					args.where = {
						...args.where,
						tenantId,
					};
					return query(args);
				},

				async findFirst({ model, args, query }) {
					args.where = {
						...args.where,
						tenantId,
					};
					return query(args);
				},

				async create({ model, args, query }) {
					args.data = {
						...args.data,
					};
					return query(args);
				},

				async update({ model, args, query }) {
					args.where = {
						...args.where,
						tenantId,
					};
					return query(args);
				},

				async delete({ model, args, query }) {
					args.where = {
						...args.where,
						tenantId,
					};
					return query(args);
				},
			},
		},
	});
};
