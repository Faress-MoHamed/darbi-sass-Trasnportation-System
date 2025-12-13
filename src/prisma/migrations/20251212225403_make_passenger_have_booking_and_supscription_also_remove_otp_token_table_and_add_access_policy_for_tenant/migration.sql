/*
  Warnings:

  - You are about to drop the column `user_id` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the `otp_tokens` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tenant_id]` on the table `buses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenant_id]` on the table `passengers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "passenger_access_policy" AS ENUM ('open', 'restricted');

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_user_id_fkey";

-- DropForeignKey
ALTER TABLE "otp_tokens" DROP CONSTRAINT "otp_tokens_otpId_fkey";

-- DropForeignKey
ALTER TABLE "otp_tokens" DROP CONSTRAINT "otp_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "passengers" DROP CONSTRAINT "passengers_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_user_id_fkey";

-- DropIndex
DROP INDEX "bookings_user_id_idx";

-- DropIndex
DROP INDEX "bookings_user_id_status_idx";

-- DropIndex
DROP INDEX "otp_code_key";

-- DropIndex
DROP INDEX "subscriptions_user_id_idx";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "user_id",
ADD COLUMN     "passenger_id" UUID;

-- AlterTable
ALTER TABLE "otp" ADD COLUMN     "token" TEXT,
ADD COLUMN     "used_at" TIMESTAMP(3),
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "passengers" ALTER COLUMN "tenant_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "user_id",
ADD COLUMN     "passenger_id" UUID;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "access_policy" "passenger_access_policy" NOT NULL DEFAULT 'open';

-- DropTable
DROP TABLE "otp_tokens";

-- CreateIndex
CREATE INDEX "bookings_passenger_id_idx" ON "bookings"("passenger_id");

-- CreateIndex
CREATE INDEX "bookings_passenger_id_status_idx" ON "bookings"("passenger_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "buses_tenant_id_key" ON "buses"("tenant_id");

-- CreateIndex
CREATE INDEX "otp_code_idx" ON "otp"("code");

-- CreateIndex
CREATE INDEX "otp_token_idx" ON "otp"("token");

-- CreateIndex
CREATE UNIQUE INDEX "passengers_id_tenant_id_key" ON "passengers"("id", "tenant_id");

-- CreateIndex
CREATE INDEX "subscriptions_passenger_id_idx" ON "subscriptions"("passenger_id");

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_passenger_id_tenant_id_fkey" FOREIGN KEY ("passenger_id", "tenant_id") REFERENCES "passengers"("id", "tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passengers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
