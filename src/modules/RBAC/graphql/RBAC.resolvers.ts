import { RBACService } from "../RBAC.service";
import { createResolvers } from "../../../helpers/createResolver";

import {
	CreatePermissionSchema,
	UpdatePermissionSchema,
	type CreatePermissionDTO,
	type UpdatePermissionDTO,
} from "../dto/permission.dto";

import {
	CreateRoleSchema,
	UpdateRoleSchema,
	type CreateRoleDTO,
	type UpdateRoleDTO,
} from "../dto/role.dto";

import {
	AssignRolesToUserSchema,
	type AssignRolesToUserDTO,
} from "../dto/user-role.dto";
import { safeResolver } from "../../../helpers/safeResolver";
import { requirePermission } from "../../../middlewares/auth.middleware";

export const rbacResolvers = createResolvers({
	Query: {
		permissions: safeResolver(async (_, __, context) =>
			new RBACService(context.prisma).getAllPermissions()
		),

		permission: safeResolver(
			async (_: any, { id }: { id: number }, context) => {
				return new RBACService(context.prisma).getPermissionById(id);
			}
		),

		roles: safeResolver(async (_: any, __: any, context) => {
			const roles = await new RBACService(context.prisma).getAllRoles();

			return roles.map((role) => ({
				...role,
				permissions: role.rolePermissions.map((rp) => rp.permission),
			}));
		}),

		role: safeResolver(async (_: any, { id }: { id: number }, context) => {
			const role = await new RBACService(context.prisma).getRoleById(id);
			if (!role) return null;

			return {
				...role,
				permissions: role.rolePermissions.map((rp) => rp.permission),
			};
		}),

		userRoles: safeResolver(
			async (_: any, { userId }: { userId: string }, context) => {
				const userRoles = await new RBACService(context.prisma).getUserRoles(
					userId
				);
				return userRoles.map((ur) => ur.role);
			}
		),

		hasPermission: safeResolver(
			async (
				_: any,
				{ userId, permissionKey }: { userId: string; permissionKey: string },
				context
			) => new RBACService(context.prisma).hasPermission(userId, permissionKey)
		),
	},
	Mutation: {
		rbac: () => ({}), // Returns empty object for namespace
	},
	PermessionMutations: {
		createPermission: requirePermission("permissions.manage")(
			safeResolver(
				async (_: any, { input }: { input: CreatePermissionDTO }, context) => {
					const data = CreatePermissionSchema.parse(input);
					return new RBACService(context.prisma).createPermission(
						data.key,
						data.description
					);
				}
			)
		),

		updatePermission: requirePermission("permissions.manage")(
			safeResolver(
				async (
					_: any,
					{ id, input }: { id: number; input: UpdatePermissionDTO },
					context
				) => {
					const data = UpdatePermissionSchema.parse(input);

					return new RBACService(context.prisma).updatePermission(
						id,
						data.key,
						data.description
					);
				}
			)
		),

		deletePermission: requirePermission("permissions.manage")(
			safeResolver(async (_: any, { id }: { id: number }, context) =>
				new RBACService(context.prisma).deletePermission(id)
			)
		),

		createRole: safeResolver(
			async (_: any, { input }: { input: CreateRoleDTO }, context) => {
				const data = CreateRoleSchema.parse(input);
				const role = await new RBACService(context.prisma).createRole(
					context.tenant?.tenantId!,
					data.name,
					data.description || null,
					data.permissionIds
				);

				return {
					...role,
					permissions: role.rolePermissions.map((rp) => rp.permission),
				};
			}
		),

		updateRole: requirePermission("roles.update")(
			safeResolver(
				async (
					_: any,
					{ id, input }: { id: number; input: UpdateRoleDTO },
					context
				) => {
					const data = UpdateRoleSchema.parse(input);

					const role = await new RBACService(context.prisma).updateRole(
						id,
						data.name,
						data.description,
						data.permissionIds
					);

					return {
						...role,
						permissions: role.rolePermissions.map((rp) => rp.permission),
					};
				}
			)
		),

		deleteRole: requirePermission("roles.delete")(
			safeResolver(async (_: any, { id }: { id: number }, context) =>
				new RBACService(context.prisma).deleteRole(id)
			)
		),

		assignPermissionsToRole: requirePermission("users.manage_roles")(
			safeResolver(
				async (
					_: any,
					{
						roleId,
						permissionIds,
					}: { roleId: number; permissionIds: number[] },
					context
				) => {
					const role = await new RBACService(
						context.prisma
					).assignPermissionsToRole(roleId, permissionIds);

					return {
						...role!,
						permissions: role!.rolePermissions.map((rp) => rp.permission),
					};
				}
			)
		),

		assignRolesToUser: requirePermission("users.manage_roles")(
			safeResolver(
				async (_: any, { input }: { input: AssignRolesToUserDTO }, context) => {
					const data = AssignRolesToUserSchema.parse(input);
					return new RBACService(context.prisma).assignRolesToUser(
						data.userId,
						data.roleIds
					);
				}
			)
		),

		removeRoleFromUser: requirePermission("users.manage_roles")(
			safeResolver(
				async (
					_: any,
					{ userId, roleId }: { userId: string; roleId: number },
					context
				) => new RBACService(context.prisma).removeRoleFromUser(userId, roleId)
			)
		),
	},
});
