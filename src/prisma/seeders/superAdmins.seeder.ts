import { PrismaClient, UserRoleEnum, RoleType } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import {
	getAllPermissions,
	PERMISSIONS,
} from "../../helpers/permissionhelper";

const SALT_ROUNDS = 12;

// Map role names to RoleType enum values
const ROLE_TYPE_MAP: Record<string, RoleType> = {
	SuperAdmin: RoleType.super_admin,
	Admin: RoleType.admin,
	Supervisor: RoleType.manager, // Using 'manager' from enum
	Driver: RoleType.driver,
	Passenger: RoleType.passenger,
};

// Role definitions with their permissions
const ROLE_DEFINITIONS = {
	SuperAdmin: {
		name: "Super Admin",
		description: "Full system access with all permissions",
		permissions: [PERMISSIONS.SUPER_ADMIN, PERMISSIONS.SYSTEM_FULL_ACCESS],
	},
	Admin: {
		name: "Admin",
		description: "Administrative access to manage organization",
		permissions: [
			// User Management
			PERMISSIONS.USERS_VIEW,
			PERMISSIONS.USERS_CREATE,
			PERMISSIONS.USERS_UPDATE,
			PERMISSIONS.USERS_DELETE,
			PERMISSIONS.USERS_MANAGE_ROLES,
			PERMISSIONS.USERS_MANAGE_STATUS,
			PERMISSIONS.USERS_RESET_PASSWORD,
			PERMISSIONS.USERS_VIEW_ACTIVITY,

			// Role Management
			PERMISSIONS.ROLES_VIEW,
			PERMISSIONS.ROLES_MANAGE,

			// Driver Management
			PERMISSIONS.DRIVERS_VIEW,
			PERMISSIONS.DRIVERS_CREATE,
			PERMISSIONS.DRIVERS_UPDATE,
			PERMISSIONS.DRIVERS_DELETE,
			PERMISSIONS.DRIVERS_MANAGE_STATUS,
			PERMISSIONS.DRIVERS_VIEW_PERFORMANCE,
			PERMISSIONS.DRIVERS_ASSIGN_TRIPS,

			// Bus Management
			PERMISSIONS.BUSES_VIEW,
			PERMISSIONS.BUSES_CREATE,
			PERMISSIONS.BUSES_UPDATE,
			PERMISSIONS.BUSES_DELETE,
			PERMISSIONS.BUSES_MANAGE_STATUS,
			PERMISSIONS.BUSES_VIEW_GPS,
			PERMISSIONS.BUSES_MANAGE_MAINTENANCE,

			// Route & Station Management
			PERMISSIONS.ROUTES_VIEW,
			PERMISSIONS.ROUTES_CREATE,
			PERMISSIONS.ROUTES_UPDATE,
			PERMISSIONS.ROUTES_DELETE,
			PERMISSIONS.ROUTES_MANAGE_STATIONS,
			PERMISSIONS.ROUTES_ACTIVATE_DEACTIVATE,
			PERMISSIONS.STATIONS_VIEW,
			PERMISSIONS.STATIONS_CREATE,
			PERMISSIONS.STATIONS_UPDATE,
			PERMISSIONS.STATIONS_DELETE,

			// Trip Management
			PERMISSIONS.TRIPS_VIEW,
			PERMISSIONS.TRIPS_CREATE,
			PERMISSIONS.TRIPS_UPDATE,
			PERMISSIONS.TRIPS_DELETE,
			PERMISSIONS.TRIPS_MANAGE_STATUS,
			PERMISSIONS.TRIPS_VIEW_LOGS,
			PERMISSIONS.TRIPS_VIEW_PERFORMANCE,

			// Passenger & Booking Management
			PERMISSIONS.PASSENGERS_VIEW,
			PERMISSIONS.PASSENGERS_CREATE,
			PERMISSIONS.PASSENGERS_UPDATE,
			PERMISSIONS.PASSENGERS_MANAGE_SUBSCRIPTIONS,
			PERMISSIONS.PASSENGERS_MANAGE_LOYALTY,
			PERMISSIONS.BOOKINGS_VIEW,
			PERMISSIONS.BOOKINGS_CREATE,
			PERMISSIONS.BOOKINGS_UPDATE,
			PERMISSIONS.BOOKINGS_CANCEL,
			PERMISSIONS.BOOKINGS_CONFIRM,

			// Financial Management
			PERMISSIONS.FINANCE_VIEW_REVENUE,
			PERMISSIONS.FINANCE_VIEW_EXPENSES,
			PERMISSIONS.FINANCE_MANAGE_EXPENSES,
			PERMISSIONS.FINANCE_GENERATE_REPORTS,
			PERMISSIONS.FINANCE_EXPORT_REPORTS,
			PERMISSIONS.PAYMENTS_VIEW,
			PERMISSIONS.PAYMENTS_PROCESS,
			PERMISSIONS.PAYMENTS_REFUND,

			// Analytics & Reports
			PERMISSIONS.ANALYTICS_VIEW_DASHBOARD,
			PERMISSIONS.ANALYTICS_VIEW_KPIS,
			PERMISSIONS.ANALYTICS_VIEW_REPORTS,
			PERMISSIONS.ANALYTICS_EXPORT_DATA,

			// Notifications & Support
			PERMISSIONS.NOTIFICATIONS_VIEW,
			PERMISSIONS.NOTIFICATIONS_CREATE,
			PERMISSIONS.NOTIFICATIONS_SCHEDULE,
			PERMISSIONS.SUPPORT_VIEW_TICKETS,
			PERMISSIONS.SUPPORT_REPLY_TICKET,
			PERMISSIONS.SUPPORT_MANAGE_STATUS,
			PERMISSIONS.SUPPORT_CLOSE_TICKET,

			// Emergency
			PERMISSIONS.EMERGENCY_VIEW_ALERTS,
			PERMISSIONS.EMERGENCY_RESPOND,

			// Settings
			PERMISSIONS.SETTINGS_VIEW,
			PERMISSIONS.SETTINGS_UPDATE,
			PERMISSIONS.AUDIT_VIEW_LOGS,
			PERMISSIONS.LOGS_VIEW,
		],
	},
	Supervisor: {
		name: "Supervisor",
		description: "Supervisory access to monitor and manage operations",
		permissions: [
			// View permissions for most entities
			PERMISSIONS.USERS_VIEW,
			PERMISSIONS.DRIVERS_VIEW,
			PERMISSIONS.DRIVERS_VIEW_PERFORMANCE,
			PERMISSIONS.DRIVERS_ASSIGN_TRIPS,
			PERMISSIONS.BUSES_VIEW,
			PERMISSIONS.BUSES_VIEW_GPS,
			PERMISSIONS.ROUTES_VIEW,
			PERMISSIONS.STATIONS_VIEW,
			PERMISSIONS.TRIPS_VIEW,
			PERMISSIONS.TRIPS_UPDATE,
			PERMISSIONS.TRIPS_MANAGE_STATUS,
			PERMISSIONS.TRIPS_VIEW_LOGS,
			PERMISSIONS.TRIPS_VIEW_PERFORMANCE,
			PERMISSIONS.PASSENGERS_VIEW,
			PERMISSIONS.BOOKINGS_VIEW,
			PERMISSIONS.BOOKINGS_CONFIRM,
			PERMISSIONS.BOOKINGS_CANCEL,
			PERMISSIONS.TICKETS_VIEW,
			PERMISSIONS.TICKETS_VERIFY,
			PERMISSIONS.PAYMENTS_VIEW,
			PERMISSIONS.ANALYTICS_VIEW_DASHBOARD,
			PERMISSIONS.ANALYTICS_VIEW_KPIS,
			PERMISSIONS.ANALYTICS_VIEW_REPORTS,
			PERMISSIONS.MAPS_VIEW,
			PERMISSIONS.MAPS_TRACK_BUSES,
			PERMISSIONS.NOTIFICATIONS_VIEW,
			PERMISSIONS.NOTIFICATIONS_CREATE,
			PERMISSIONS.SUPPORT_VIEW_TICKETS,
			PERMISSIONS.SUPPORT_REPLY_TICKET,
			PERMISSIONS.EMERGENCY_VIEW_ALERTS,
			PERMISSIONS.EMERGENCY_RESPOND,
		],
	},
	Driver: {
		name: "Driver",
		description: "Driver access to manage assigned trips",
		permissions: [
			PERMISSIONS.TRIPS_VIEW,
			PERMISSIONS.TRIPS_UPDATE,
			PERMISSIONS.TRIPS_VIEW_LOGS,
			PERMISSIONS.BOOKINGS_VIEW,
			PERMISSIONS.PASSENGERS_VIEW,
			PERMISSIONS.MAPS_VIEW,
			PERMISSIONS.EMERGENCY_CREATE_ALERT,
			PERMISSIONS.SUPPORT_CREATE_TICKET,
			PERMISSIONS.SUPPORT_VIEW_TICKETS,
		],
	},
	Passenger: {
		name: "Passenger",
		description: "Passenger access for booking and managing trips",
		permissions: [
			PERMISSIONS.ROUTES_VIEW,
			PERMISSIONS.STATIONS_VIEW,
			PERMISSIONS.TRIPS_VIEW,
			PERMISSIONS.BOOKINGS_VIEW,
			PERMISSIONS.BOOKINGS_CREATE,
			PERMISSIONS.BOOKINGS_CANCEL,
			PERMISSIONS.TICKETS_VIEW,
			PERMISSIONS.PAYMENTS_VIEW,
			PERMISSIONS.PAYMENTS_PROCESS,
			PERMISSIONS.PAYMENTS_VIEW_METHODS,
			PERMISSIONS.PAYMENTS_MANAGE_METHODS,
			PERMISSIONS.SUBSCRIPTIONS_VIEW,
			PERMISSIONS.SUBSCRIPTIONS_CREATE,
			PERMISSIONS.SUBSCRIPTIONS_CANCEL,
			PERMISSIONS.SUPPORT_CREATE_TICKET,
			PERMISSIONS.SUPPORT_VIEW_TICKETS,
			PERMISSIONS.MAPS_VIEW,
		],
	},
};

// Sample users for each role
const SAMPLE_USERS = [
	// Super Admins
	{
		id: "10000000-0000-0000-0000-000000000001",
		name: "Super Admin One",
		email: "superadmin1@example.com",
		phone: "+201000000001",
		password: "SuperAdmin@123",
		role: UserRoleEnum.SuperAdmin,
		roleName: "SuperAdmin",
	},
	{
		id: "10000000-0000-0000-0000-000000000002",
		name: "Super Admin Two",
		email: "superadmin2@example.com",
		phone: "+201000000002",
		password: "SuperAdmin@123",
		role: UserRoleEnum.SuperAdmin,
		roleName: "SuperAdmin",
	},
	{
		id: "10000000-0000-0000-0000-000000000003",
		name: "Super Admin Three",
		email: "superadmin3@example.com",
		phone: "+201000000003",
		password: "SuperAdmin@123",
		role: UserRoleEnum.SuperAdmin,
		roleName: "SuperAdmin",
	},

	// Admins
	{
		id: "20000000-0000-0000-0000-000000000001",
		name: "Admin User",
		email: "admin@example.com",
		phone: "+201100000001",
		password: "Admin@123",
		role: UserRoleEnum.admin,
		roleName: "Admin",
	},
	{
		id: "20000000-0000-0000-0000-000000000002",
		name: "Admin Manager",
		email: "admin.manager@example.com",
		phone: "+201100000002",
		password: "Admin@123",
		role: UserRoleEnum.admin,
		roleName: "Admin",
	},

	// Supervisors
	{
		id: "30000000-0000-0000-0000-000000000001",
		name: "Supervisor One",
		email: "supervisor1@example.com",
		phone: "+201200000001",
		password: "Supervisor@123",
		role: null, // UserRoleEnum doesn't have supervisor
		roleName: "Supervisor",
	},
	{
		id: "30000000-0000-0000-0000-000000000002",
		name: "Supervisor Two",
		email: "supervisor2@example.com",
		phone: "+201200000002",
		password: "Supervisor@123",
		role: null,
		roleName: "Supervisor",
	},

	// Drivers
	{
		id: "40000000-0000-0000-0000-000000000001",
		name: "Driver Ahmed",
		email: "driver1@example.com",
		phone: "+201300000001",
		password: "Driver@123",
		role: null,
		roleName: "Driver",
	},
	{
		id: "40000000-0000-0000-0000-000000000002",
		name: "Driver Mohamed",
		email: "driver2@example.com",
		phone: "+201300000002",
		password: "Driver@123",
		role: null,
		roleName: "Driver",
	},
	{
		id: "40000000-0000-0000-0000-000000000003",
		name: "Driver Ali",
		email: "driver3@example.com",
		phone: "+201300000003",
		password: "Driver@123",
		role: null,
		roleName: "Driver",
	},

	// Passengers
	{
		id: "50000000-0000-0000-0000-000000000001",
		name: "Passenger John",
		email: "passenger1@example.com",
		phone: "+201400000001",
		password: "Passenger@123",
		role: null,
		roleName: "Passenger",
	},
	{
		id: "50000000-0000-0000-0000-000000000002",
		name: "Passenger Sarah",
		email: "passenger2@example.com",
		phone: "+201400000002",
		password: "Passenger@123",
		role: null,
		roleName: "Passenger",
	},
];

async function seedPermissions() {
	console.log("\n🔑 Seeding Permissions...");
	const allPermissions = getAllPermissions();

	for (const perm of allPermissions) {
		await prisma.permission.upsert({
			where: { key: perm.key },
			update: { description: perm.description },
			create: {
				key: perm.key,
				description: perm.description,
			},
		});
	}

	console.log(`✅ ${allPermissions.length} permissions created/updated`);
}

export async function seedRoles(TENANT_ID: string) {
	console.log("\n👥 Seeding Roles...");

	const roleMap = new Map<string, string>(); // roleName -> roleId

	for (const [roleName, roleData] of Object.entries(ROLE_DEFINITIONS)) {
		const roleType = ROLE_TYPE_MAP[roleName];
		if (!roleType) continue;

		const role = await prisma.role.upsert({
			where: {
				tenantId_type: {
					tenantId: TENANT_ID,
					type: roleType,
				},
			},
			update: {
				name: roleData.name,
				description: roleData.description,
			},
			create: {
				tenantId: TENANT_ID,
				type: roleType,
				name: roleData.name,
				description: roleData.description,
			},
		});

		roleMap.set(roleName, role.id);

		await prisma.rolePermission.deleteMany({
			where: { roleId: role.id },
		});

		for (const permKey of roleData.permissions) {
			const permission = await prisma.permission.findUnique({
				where: { key: permKey },
			});

			if (permission) {
				await prisma.rolePermission.create({
					data: {
						roleId: role.id,
						permissionId: permission.id,
					},
				});
			}
		}

		console.log(`✅ Role synced: ${role.name}`);
	}

	return roleMap;
}

async function seedUsers(roleMap: Map<string, string>, TENANT_ID: string) {
	console.log("\n👤 Seeding Users...");

	for (const userData of SAMPLE_USERS) {
		const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

		const user = await prisma.user.upsert({
			where: { id: userData.id },
			update: {
				name: userData.name,
				email: userData.email,
				phone: userData.phone,
				password: hashedPassword,
				status: "active",
				mustChangePassword: false,
				language: "en",
				role: userData.role,
			},
			create: {
				id: userData.id,
				name: userData.name,
				email: userData.email,
				phone: userData.phone,
				password: hashedPassword,
				status: "active",
				mustChangePassword: false,
				language: "en",
				role: userData.role,
			},
		});

		// Assign role via UserRole table
		const roleId = roleMap.get(userData.roleName);
		if (roleId) {
			await prisma.userRole.upsert({
				where: {
					userId_roleId: {
						userId: user.id,
						roleId: roleId,
					},
				},
				update: {},
				create: {
					userId: user.id,
					roleId: roleId,
					tenantId: TENANT_ID,
				},
			});
		}

		// Create Driver record if role is Driver
		if (userData.roleName === "Driver") {
			await prisma.driver.upsert({
				where: { userId: user.id },
				update: {},
				create: {
					tenantId: TENANT_ID,
					userId: user.id,
					licenseNumber: `LIC${userData.id.slice(-6)}`,
					status: "available",
					rating: 4.5,
				},
			});
		}

		// Create Passenger record if role is Passenger
		if (userData.roleName === "Passenger") {
			await prisma.passenger.upsert({
				where: {
					tenantId_userId: {
						tenantId: TENANT_ID,
						userId: user.id,
					},
				},
				update: {},
				create: {
					tenantId: TENANT_ID,
					userId: user.id,
					subscriptionStatus: "active",
					pointsBalance: 100,
				},
			});
		}

		// Create activity log
		await prisma.log.create({
			data: {
				tenantId: TENANT_ID,
				userId: user.id,
				action: "User Created via Seeder",
				entityType: "User",
				entityId: user.id,
				ipAddress: "127.0.0.1",
			},
		});

		console.log(`✅ User created: ${user.name} (${userData.roleName})`);
	}
}

export async function seederInitializeProject() {
	console.log("\n🚀 Starting Database Seeding...\n");

	try {
		// Create tenant
		const tenant = await prisma.tenant.create({
			data: {
				name: "Main Organization",
				status: "active",
			},
		});

		console.log("✅ Tenant created:", tenant.name);

		// Seed permissions
		await seedPermissions();

		// Seed roles
		const roleMap = await seedRoles(tenant.id);

		// Seed users
		await seedUsers(roleMap, tenant.id);

		// Print summary
		console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("📋 SEEDED USERS CREDENTIALS");
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

		const groupedUsers = SAMPLE_USERS.reduce((acc, user) => {
			if (!acc[user.roleName]) acc[user.roleName] = [];
			acc[user.roleName].push(user);
			return acc;
		}, {} as Record<string, typeof SAMPLE_USERS>);

		for (const [roleName, users] of Object.entries(groupedUsers)) {
			console.log(`\n${roleName.toUpperCase()}S:`);
			users.forEach((user, index) => {
				console.log(`  ${index + 1}. ${user.name}`);
				console.log(`     Email: ${user.email}`);
				console.log(`     Phone: ${user.phone}`);
				console.log(`     Password: ${user.password}`);
			});
		}

		console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("✅ Seeding completed successfully!");
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
	} catch (error) {
		console.error("❌ Error during seeding:", error);
		throw error;
	}
}
