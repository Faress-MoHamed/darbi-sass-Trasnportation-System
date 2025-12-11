-- DropForeignKey
ALTER TABLE "logs" DROP CONSTRAINT "logs_tenant_id_fkey";

-- AlterTable
ALTER TABLE "logs" ALTER COLUMN "tenant_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
