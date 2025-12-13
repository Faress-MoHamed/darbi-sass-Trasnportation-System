/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,type]` on the table `roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "roles_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_type_key" ON "roles"("tenant_id", "type");
