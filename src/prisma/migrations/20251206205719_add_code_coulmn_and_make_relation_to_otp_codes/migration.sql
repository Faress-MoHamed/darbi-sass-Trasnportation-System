/*
  Warnings:

  - You are about to drop the column `used_at` on the `otp` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `otp` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[otpId]` on the table `otp_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "otp" DROP COLUMN "used_at",
DROP COLUMN "verified",
ADD COLUMN     "code" VARCHAR(10) NOT NULL;

-- AlterTable
ALTER TABLE "otp_tokens" ADD COLUMN     "otpId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "otp_tokens_otpId_key" ON "otp_tokens"("otpId");

-- AddForeignKey
ALTER TABLE "otp_tokens" ADD CONSTRAINT "otp_tokens_otpId_fkey" FOREIGN KEY ("otpId") REFERENCES "otp"("id") ON DELETE SET NULL ON UPDATE CASCADE;
