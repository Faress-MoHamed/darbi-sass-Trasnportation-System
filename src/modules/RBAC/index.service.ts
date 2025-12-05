import { PrismaClient, Permission, Role } from "@prisma/client";
import { CheckIfUserExist } from "../../helpers/checkIfUserExist";
import type { ResolverContext } from "../../types/ResolverTypes";

export class RBACService {
	prisma: PrismaClient;
	constructor(prisma?: PrismaClient) {
		if (!prisma) {
			throw new Error("Prisma client is required");
		}
		this.prisma = prisma;
	}
	// ========== Permission Methods ==========

	async getAllPermissions(): Promise<Permission[]> {
		return this.prisma.permission.findMany({
			orderBy: { key: "asc" },
		});
	}

	async getPermissionById(id: number): Promise<Permission | null> {
		return this.prisma.permission.findUnique({
			where: { id },
		});
	}

	async createPermission(
		key: string,
		description?: string
	): Promise<Permission> {
		return this.prisma.permission.create({
			data: { key, description },
		});
	}

	async updatePermission(
		id: number,
		key?: string,
		description?: string
	): Promise<Permission> {
		return this.prisma.permission.update({
			where: { id },
			data: { key, description },
		});
	}

	async deletePermission(id: number): Promise<boolean> {
		await this.prisma.permission.delete({
			where: { id },
		});
		return true;
	}

	// ========== Role Methods ==========

	async getAllRoles() {
		return this.prisma.role.findMany({
			include: {
				rolePermissions: {
					include: {
						permission: true,
					},
				},
			},
		});
	}

	async getRoleById(id: number) {
		return this.prisma.role.findUnique({
			where: { id },
			include: {
				rolePermissions: {
					include: {
						permission: true,
					},
				},
			},
		});
	}

	async createRole(
		tenantId: string,
		name: string,
		description: string | null,
		permissionIds: number[]
	) {
		return this.prisma.role.create({
			data: {
				tenantId,
				name,
				description,
				rolePermissions: {
					create: permissionIds.map((permissionId) => ({
						permissionId,
					})),
				},
			},
			include: {
				rolePermissions: {
					include: {
						permission: true,
					},
				},
			},
		});
	}

	async updateRole(
		id: number,
		name?: string,
		description?: string,
		permissionIds?: number[]
	) {
		const updateData: any = {};

		if (name !== undefined) updateData.name = name;
		if (description !== undefined) updateData.description = description;

		// If permissionIds provided, update role permissions
		if (permissionIds !== undefined) {
			// Delete existing permissions
			await this.prisma.rolePermission.deleteMany({
				where: { roleId: id },
			});

			// Create new permissions
			updateData.rolePermissions = {
				create: permissionIds.map((permissionId) => ({
					permissionId,
				})),
			};
		}

		return this.prisma.role.update({
			where: { id },
			data: updateData,
			include: {
				rolePermissions: {
					include: {
						permission: true,
					},
				},
			},
		});
	}

	async deleteRole(id: number): Promise<boolean> {
		await this.prisma.role.delete({
			where: { id },
		});
		return true;
	}

	// ========== Role-Permission Assignment ==========

	async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
		// Delete all existing permissions for this role
		await this.prisma.rolePermission.deleteMany({
			where: { roleId },
		});

		// Create new permission assignments
		await this.prisma.rolePermission.createMany({
			data: permissionIds.map((permissionId) => ({
				roleId,
				permissionId,
			})),
		});

		return this.getRoleById(roleId);
	}

	// ========== User-Role Assignment ==========

	async assignRolesToUser(
		userId: string,
		roleIds: number[],
		context: ResolverContext
	): Promise<boolean> {
		await CheckIfUserExist(userId);
		// Delete existing roles
		await this.prisma.userRole.deleteMany({
			where: { userId },
		});

		// Assign new roles
		await this.prisma.userRole.createMany({
			data: roleIds.map((roleId) => ({
				userId,
				roleId,
				tenantId: context.tenant?.tenantId!,
			})),
		});

		return true;
	}

	async removeRoleFromUser(userId: string, roleId: number): Promise<boolean> {
		await CheckIfUserExist(userId);
		await this.prisma.userRole.delete({
			where: {
				userId_roleId: { userId, roleId },
			},
		});
		return true;
	}

	async getUserRoles(userId?: string) {
		await CheckIfUserExist(userId);
		return await this.prisma.userRole.findMany({
			where: { userId },
			include: {
				role: {
					include: {
						rolePermissions: {
							include: {
								permission: true,
							},
						},
					},
				},
			},
		});
	}

	// ========== Permission Checking ==========

	async hasPermission(userId: string, permissionKey: string): Promise<boolean> {
		await CheckIfUserExist(userId);
		const userRoles = await this.prisma.userRole.findMany({
			where: { userId },
			include: {
				role: {
					include: {
						rolePermissions: {
							include: {
								permission: true,
							},
						},
					},
				},
			},
		});
		// Check if any role has the permission
		return userRoles.some((userRole) =>
			userRole.role.rolePermissions.some(
				(rp) => rp.permission.key === permissionKey
			)
		);
	}

	async getUserPermissions(userId: string): Promise<string[]> {
		await CheckIfUserExist(userId);
		const userRoles = await this.getUserRoles(userId);

		const permissions = new Set<string>();
		userRoles.forEach((userRole) => {
			userRole.role.rolePermissions.forEach((rp) => {
				permissions.add(rp.permission.key);
			});
		});

		return Array.from(permissions);
	}
}
