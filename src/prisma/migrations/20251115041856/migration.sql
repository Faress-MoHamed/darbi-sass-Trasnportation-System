/*
  Warnings:

  - Made the column `password_hash` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "UserRoleEnum" ADD VALUE 'SuperAdmin';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;
