/*
  Warnings:

  - You are about to drop the column `tenant_id` on the `access_tokens` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "access_tokens" DROP CONSTRAINT "access_tokens_tenant_id_fkey";

-- AlterTable
ALTER TABLE "access_tokens" DROP COLUMN "tenant_id";
