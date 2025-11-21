import { PrismaClient } from '@prisma/client';
import { getAllPermissions } from '../../helpers/permissionhelper';

const prisma = new PrismaClient();

async function seedPermissions() {
  console.log('Starting permissions seeding...');

  try {
    const permissions = getAllPermissions();

    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { key: permission.key },
        update: { description: permission.description },
        create: permission,
      });
    }

    console.log(`✅ Successfully seeded ${permissions.length} permissions`);
  } catch (error) {
    console.error('Error seeding permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPermissions()
  .then(() => {
    console.log('Permission seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Permission seeding failed:', error);
    process.exit(1);
  });