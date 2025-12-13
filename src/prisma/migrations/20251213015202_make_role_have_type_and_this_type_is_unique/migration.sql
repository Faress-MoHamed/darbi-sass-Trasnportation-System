/*
  Warnings:

  - The values [driver,passenger] on the enum `UserRoleEnum` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `role_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[type]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('super_admin', 'admin', 'manager', 'driver', 'passenger', 'support');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRoleEnum_new" AS ENUM ('SuperAdmin', 'admin');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRoleEnum_new" USING ("role"::text::"UserRoleEnum_new");
ALTER TYPE "UserRoleEnum" RENAME TO "UserRoleEnum_old";
ALTER TYPE "UserRoleEnum_new" RENAME TO "UserRoleEnum";
DROP TYPE "public"."UserRoleEnum_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_id_fkey";

-- AlterTable
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_pkey",
ALTER COLUMN "role_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");

-- AlterTable
ALTER TABLE "roles" DROP CONSTRAINT "roles_pkey",
ADD COLUMN     "type" "RoleType" NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "roles_id_seq";

-- AlterTable
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_pkey",
ALTER COLUMN "role_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id");

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "role" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "roles_type_key" ON "roles"("type");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
