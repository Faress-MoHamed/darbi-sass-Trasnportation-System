import { prisma } from "../../lib/prisma";
import { seederInitializeProject } from "./superAdmins.seeder";

seederInitializeProject()
	.then(() => {
		console.log("🎉 All done!");
		process.exit(0);
	})
	.catch((e) => {
		console.error("❌ Seeding failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});