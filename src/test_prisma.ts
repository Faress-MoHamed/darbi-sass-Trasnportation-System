import "dotenv/config";
import { prisma } from "./lib/prisma";

async function test() {
    try {
        console.log("Testing Prisma connection...");
        const count = await prisma.user.count();
        console.log(`✅ Success! Found ${count} users`);
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
