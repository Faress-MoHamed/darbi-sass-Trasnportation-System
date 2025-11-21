import gql from "graphql-tag";

export const RBACTypeDef = gql`
	type Permission {
		id: Int!
		key: String!
		description: String
		rolePermissions: [RolePermission!]
	}

	type Role {
		id: Int!
		tenantId: String!
		name: String!
		description: String
		rolePermissions: [RolePermission!]
		userRoles: [UserRole!]
		permissionCount: Int
	}

	type RolePermission {
		roleId: Int!
		permissionId: Int!
		role: Role!
		permission: Permission!
	}

	type RoleWithPermissions {
		id: Int!
		name: String!
		description: String
		permissions: [Permission!]!
	}

	input CreateRoleInput {
		name: String!
		description: String
		permissionIds: [Int!]!
	}

	input UpdateRoleInput {
		name: String
		description: String
		permissionIds: [Int!]
	}

	input CreatePermissionInput {
		key: String!
		description: String
	}

	input AssignRoleToUserInput {
		userId: String!
		roleIds: [Int!]!
	}

	type Query {
		# Get all permissions
		permissions: [Permission!]!

		# Get permission by ID
		permission(id: Int!): Permission

		# Get all roles for tenant
		roles(tenantId: String!): [RoleWithPermissions!]!

		# Get role by ID with permissions
		role(id: Int!): RoleWithPermissions

		# Get user roles
		userRoles(userId: String!): [Role!]!

		# Check if user has permission
		hasPermission(userId: String!, permissionKey: String!): Boolean!
	}

	type Mutation {
		# Permission Management
		createPermission(input: CreatePermissionInput!): Permission!
		updatePermission(id: Int!, input: CreatePermissionInput!): Permission!
		deletePermission(id: Int!): Boolean!

		# Role Management
		createRole(tenantId: String!, input: CreateRoleInput!): RoleWithPermissions!
		updateRole(id: Int!, input: UpdateRoleInput!): RoleWithPermissions!
		deleteRole(id: Int!): Boolean!

		# Assign permissions to role
		assignPermissionsToRole(
			roleId: Int!
			permissionIds: [Int!]!
		): RoleWithPermissions!

		# Assign roles to user
		assignRolesToUser(input: AssignRoleToUserInput!): Boolean!

		# Remove role from user
		removeRoleFromUser(userId: String!, roleId: Int!): Boolean!
	}
`;
