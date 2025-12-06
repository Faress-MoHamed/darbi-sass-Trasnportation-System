/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `otp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "otp_code_key" ON "otp"("code");
