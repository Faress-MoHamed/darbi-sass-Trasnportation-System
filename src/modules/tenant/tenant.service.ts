import { TenantRepository } from "./Tenant.repositry";
import {
	createTenantInput,
	type CreateTenantPayload,
} from "./dto/create-tenant.input";
import { AppError } from "../../errors/AppError";
import { AuthService } from "../auth/auth.service";
import type { Tenant, RoleType } from "@prisma/client";
import { seedRoles } from "../../prisma/seeders/superAdmins.seeder";

export class TenantService {
	private tenantRepo = new TenantRepository();
	private authService = new AuthService();

	getTenants = async (args: { id?: string; meta?: any }) => {
		if (args?.id) {
			const tenant = await this.tenantRepo.findFirstById(args.id);
			return tenant ? [tenant] : [];
		}
		const tenants = await this.tenantRepo.getTenantsWithPagination(args.meta);
		return tenants ?? [];
	};

	getOneTenant = async (id?: string): Promise<Tenant | null> => {
		if (!id) return null;
		return this.tenantRepo.findFirstById(id);
	};

	CuTenant = async (payload: CreateTenantPayload) => {
		const { tenantData } = createTenantInput(payload);

		const tenant = await this.tenantRepo.prisma.$transaction(
			async (tx) => {
				if (tenantData?.id) {
					return await this.tenantRepo.updateTenant(
						tenantData.id,
						tenantData,
						tx
					);
				} else {
					// Check tenant existence
					const existTenant = await this.tenantRepo.findFirstByName(
						tenantData.name
					);
					if (existTenant) {
						throw new AppError("Tenant With This Name Already Exists", 409);
					}

					// Create tenant suspended
					const tenantResult = await this.tenantRepo.createTenant(
						{ ...tenantData, status: "suspended" },
						tx
					);
					// Admin user handling
					const adminUser = await tx.user.findFirst({
						where: {
							phone: payload.user.phone,
						},
					});

					if (adminUser) {
						// const userRole = await tx.userRole.findFirst({
						// 	where: {
						// 		userId: adminUser.id,
						// 		tenantId: tenantResult.id,
						// 	},
						// 	select: { role: true },
						// });

						const adminRole = await tx.role.findFirst({
							where: { type: "admin" },
						});
						console.log({ adminRole });
						await tx.userRole.create({
							data: {
								userId: adminUser.id,
								tenantId: tenantResult.id,
								roleId: adminRole?.id!,
							},
						});
					} else {
						await this.authService.Register(
							{
								...payload.user,
								role: "admin",
								password: payload.user.password,
								confirmPassword: payload.user.password,
								phone: payload.user.phone,
								email: payload.user.email || null,
								name: payload.user.name,
							},
							tx,
							tenantResult.id
						);
					}
					await seedRoles(tenantResult!.id, tx);
					return tenantResult;
				}
			},
			{
				timeout: 100000,
			}
		);
		return tenant;
	};

	deleteTenant = async (id: string) => {
		await this.tenantRepo.deleteTenant(id);
	};

	updateTenantStatus = async (id: string, status: Tenant["status"]) => {
		await this.tenantRepo.updateTenant(id, { status });
	};
}
