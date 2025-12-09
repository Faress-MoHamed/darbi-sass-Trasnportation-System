/*
  Warnings:

  - You are about to drop the column `vehicle_type` on the `drivers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "buses" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "vehicle_type";
