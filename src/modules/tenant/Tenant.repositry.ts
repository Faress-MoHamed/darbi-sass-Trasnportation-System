import { prisma } from "../../lib/prisma";
import { type PaginationArgs } from "../../helpers/pagination";
import { paginate } from "../../helpers/pagination";
import type { Prisma, PrismaClient } from "@prisma/client";

export class TenantRepository {
	prisma = prisma;

	findFirstById = async (id: string) => {
		return this.prisma.tenant.findFirst({ where: { id } });
	};

	findFirstByName = async (name: string) => {
		return this.prisma.tenant.findFirst({ where: { name } });
	};

	getTenantsWithPagination = async (pagination?: PaginationArgs) => {
		return paginate(this.prisma.tenant, pagination);
	};

	createTenant = async (
		data: any,
		tx?: PrismaClient | Prisma.TransactionClient
	) => {
		const client = tx ?? this.prisma;
		return client.tenant.create({ data });
	};

	updateTenant = async (
		id: string,
		data: any,
		tx?: PrismaClient | Prisma.TransactionClient
	) => {
		const client = tx ?? this.prisma;
		return client.tenant.update({ where: { id }, data });
	};

	deleteTenant = async (id: string) => {
		return this.prisma.tenant.delete({ where: { id } });
	};
}
