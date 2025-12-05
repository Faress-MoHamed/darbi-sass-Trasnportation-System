/*
  Warnings:

  - Added the required column `tenant_id` to the `user_roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_roles" ADD COLUMN     "tenant_id" UUID NOT NULL;
