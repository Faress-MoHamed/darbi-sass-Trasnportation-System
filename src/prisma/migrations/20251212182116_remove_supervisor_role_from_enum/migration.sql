/*
  Warnings:

  - The values [supervisor] on the enum `UserRoleEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRoleEnum_new" AS ENUM ('SuperAdmin', 'admin', 'driver', 'passenger');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRoleEnum_new" USING ("role"::text::"UserRoleEnum_new");
ALTER TYPE "UserRoleEnum" RENAME TO "UserRoleEnum_old";
ALTER TYPE "UserRoleEnum_new" RENAME TO "UserRoleEnum";
DROP TYPE "public"."UserRoleEnum_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'passenger';
COMMIT;
