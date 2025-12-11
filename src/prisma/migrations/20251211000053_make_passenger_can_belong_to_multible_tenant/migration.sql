/*
  Warnings:

  - You are about to drop the column `tenant_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenant_id,user_id]` on the table `passengers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_tenant_id_fkey";

-- DropIndex
DROP INDEX "passengers_user_id_key";

-- DropIndex
DROP INDEX "users_tenant_id_email_idx";

-- DropIndex
DROP INDEX "users_tenant_id_idx";

-- DropIndex
DROP INDEX "users_tenant_id_phone_idx";

-- DropIndex
DROP INDEX "users_tenant_id_status_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "tenant_id";

-- CreateIndex
CREATE UNIQUE INDEX "passengers_tenant_id_user_id_key" ON "passengers"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "users_email_phone_status_role_idx" ON "users"("email", "phone", "status", "role");
