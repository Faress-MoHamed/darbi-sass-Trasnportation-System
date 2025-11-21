import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();
const seederInitializeProject = async () => {
	const tenant = await prisma.tenant.upsert({
		where: { id: "00000000-0000-0000-0000-000000000001" },
		update: {},
		create: {
			id: "00000000-0000-0000-0000-000000000001",
			name: "Main Organization",
			planType: "enterprise",
			status: "active",
		},
	});

	console.log("✅ Tenant created:", tenant.name);

	// Define super admin users
	const superAdmins = [
		{
			id: "10000000-0000-0000-0000-000000000001",
			name: "Super Admin One",
			email: "superadmin1@example.com",
			phone: "+201000000001",
			password: "SuperAdmin@123",
		},
		{
			id: "10000000-0000-0000-0000-000000000002",
			name: "Super Admin Two",
			email: "superadmin2@example.com",
			phone: "+201000000002",
			password: "SuperAdmin@123",
		},
		{
			id: "10000000-0000-0000-0000-000000000003",
			name: "Super Admin Three",
			email: "superadmin3@example.com",
			phone: "+201000000003",
			password: "SuperAdmin@123",
		},
	];
	// Create Super Admin role
	const saltRounds = 12;

	for (const admin of superAdmins) {
		const hashedPassword = await bcrypt.hash(admin.password, saltRounds);

		// Create or update user
		const user = await prisma.user.upsert({
			where: { id: admin.id },
			update: {},
			create: {
				id: admin.id,
				tenantId: tenant.id,
				role: "SuperAdmin",
				name: admin.name,
				email: admin.email,
				phone: admin.phone,
				password: hashedPassword,
				status: "active",
				mustChangePassword: false,
				language: "en",
			},
		});

		console.log(`✅ Super Admin created: ${user.name} (${user.email})`);

		// Create a log entry for user creation
		await prisma.log.create({
			data: {
				tenantId: tenant.id,
				userId: user.id,
				action: "User Created",
				entityType: "User",
				entityId: user.id,
				ipAddress: "127.0.0.1",
			},
		});
	}

	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	superAdmins.forEach((admin, index) => {
		console.log(`\n${index + 1}. ${admin.name}`);
		console.log(`   Email: ${admin.email}`);
		console.log(`   Phone: ${admin.phone}`);
		console.log(`   Password: ${admin.password}`);
	});
	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
};
seederInitializeProject()
	.then((e) => console.log("start creating super admins"))
	.catch((e) => console.log(e));
