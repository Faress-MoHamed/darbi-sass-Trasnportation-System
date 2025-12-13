/*
  Warnings:

  - You are about to drop the column `plan_type` on the `tenants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "plan_type";

-- DropEnum
DROP TYPE "PlanType";
