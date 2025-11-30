import { PrismaClient, type Tenant } from "@prisma/client";
import { paginate, type PaginationArgs } from "../../helpers/pagination";
import {
	createTenantInput,
	type CreateTenant,
	type CreateTenantPayload,
} from "./dto/create-tenant.input";
import { AppError } from "../../errors/AppError";
import { UserService } from "../users/users.services";
import { createUserSchema } from "../users/validations/create-user.validation";
import { prisma } from "../../lib/prisma";
type argsOfGetTenants = {
	id?: string;
	meta?: PaginationArgs;
};
export class TenantService {
	private prisma = prisma;

	get Tenants() {
		return this.prisma.tenant;
	}

	get Prisma() {
		return this.prisma;
	}
	private userService = new UserService();
	getTenants = async (args: argsOfGetTenants) => {
		if (args?.id) {
			const tenant = await this.prisma.tenant.findFirst({
				where: { id: args.id },
			});

			// Always return array
			return tenant ? [tenant] : [];
		}

		const data = await paginate(this.prisma.tenant, args?.meta);
		return data ?? [];
	};

	CuTenant = async (Payload: CreateTenantPayload) => {
		const { tenantData } = createTenantInput(Payload);

		return await this.Prisma.$transaction(async (tx) => {
			if (tenantData?.id) {
				return await tx.tenant.update({
					where: { id: tenantData.id },
					data: tenantData,
				});
			}

			// Check tenant existence
			const existTenant = await tx.tenant.findFirst({
				where: { name: tenantData.name },
			});

			if (existTenant) {
				throw new AppError("this tenant already exists", 409);
			}

			// 1. Create Tenant
			const NewTenant = await tx.tenant.create({
				data: { ...tenantData },
			});
			await this.userService.createUser(
				{
					...Payload.user,
					tenantId: NewTenant.id,
					role: "admin",
					status: "pending",
				},
				tx.user
			);

			return NewTenant;
		});
	};

	deleteTenants = async (id: string) => {
		await this.prisma.tenant.delete({
			where: { id },
		});
	};

	//update tenant Status for SuperAdmins only (owners of application)
	UpdateTenantStatus = async (id: string, status: Tenant["status"]) => {
		await this.prisma.tenant.update({
			where: { id },
			data: {
				status,
			},
		});
	};
}
