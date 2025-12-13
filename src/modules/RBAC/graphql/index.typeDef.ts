import gql from "graphql-tag";

export const RBACTypeDef = gql`
	type Permission {
		id: Int!
		key: String!
		description: String
		rolePermissions: [RolePermission!]
	}

	type Role {
		id: String!
		tenantId: String!
		name: String!
		description: String
		rolePermissions: [RolePermission!]
	}

	type RolePermission {
		roleId: String!
		permissionId: Int!
		permission: Permission!
	}

	type RoleWithPermissions {
		id: String!
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
		roleIds: [String!]!
	}

	type PermissionsQuery {
		# Get all permissions
		permissions: [Permission!]!

		# Get permission by ID
		permission(id: Int!): Permission

		# Get all roles for tenant
		roles: [RoleWithPermissions!]!

		# Get role by ID with permissions
		role(id: String!): RoleWithPermissions

		# Get user roles
		userRoles(userId: String!): [Role!]!

		# Check if user has permission
		hasPermission(userId: String!, permissionKey: String!): Boolean!
	}
	type Query {
		rbac: PermissionsQuery
	}

	type PermessionMutations {
		# Permission Management
		CuPermission(input: CreatePermissionInput!, id: Int): Permission!
		deletePermission(id: Int!): Boolean!

		# Role Management
		CuRole(input: CreateRoleInput!,id: String): RoleWithPermissions!
		deleteRole(id: String!): Boolean!

		# Assign permissions to role
		assignPermissionsToRole(
			roleId: String!
			permissionIds: [Int!]!
		): RoleWithPermissions!

		# Assign roles to user
		assignRolesToUser(input: AssignRoleToUserInput!): Boolean!

		# Remove role from user
		removeRoleFromUser(userId: String!, roleId: String!): Boolean!
	}

	type Mutation {
		rbac: PermessionMutations!
	}
`;
