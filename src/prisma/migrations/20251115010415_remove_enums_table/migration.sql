/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `access_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `action_id` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `field_type_id` on the `booking_custom_fields` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `field_type_id` on the `bus_custom_fields` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `bus_status_logs` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `buses` table. All the data in the column will be lost.
  - You are about to drop the column `field_type_id` on the `driver_custom_fields` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `report_type_id` on the `financial_reports` table. All the data in the column will be lost.
  - You are about to drop the column `type_id` on the `map_layers` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `type_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `field_type_id` on the `passenger_custom_fields` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_status_id` on the `passengers` table. All the data in the column will be lost.
  - You are about to drop the column `type_id` on the `payment_methods` table. All the data in the column will be lost.
  - You are about to drop the column `method_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `field_type_id` on the `route_custom_fields` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `support_tickets` table. All the data in the column will be lost.
  - You are about to drop the column `plan_type_id` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `field_type_id` on the `trip_custom_fields` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the column `field_type_id` on the `user_custom_fields` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `audit_action_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `booking_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bus_operation_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bus_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `driver_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `field_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `financial_report_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `map_layer_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_methods_enum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plan_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `support_ticket_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenant_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trip_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_roles_enum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_statuses` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[refresh_token]` on the table `access_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refresh_token` to the `access_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `action` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field_type` to the `booking_custom_fields` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field_type` to the `bus_custom_fields` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `bus_status_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `buses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field_type` to the `driver_custom_fields` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `drivers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_type` to the `financial_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `map_layers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field_type` to the `passenger_custom_fields` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `payment_methods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field_type` to the `route_custom_fields` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `support_tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan_type` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field_type` to the `trip_custom_fields` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `trips` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field_type` to the `user_custom_fields` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('basic', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('active', 'suspended', 'inactive');

-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('admin', 'supervisor', 'driver', 'passenger');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'banned', 'pending');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('text', 'number', 'date', 'file', 'boolean', 'select');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('available', 'unavailable', 'offline');

-- CreateEnum
CREATE TYPE "BusStatus" AS ENUM ('active', 'maintenance', 'stopped');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('confirmed', 'cancelled', 'pending');

-- CreateEnum
CREATE TYPE "PaymentMethodEnum" AS ENUM ('wallet', 'credit_card', 'debit_card');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('success', 'failed', 'pending', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('wallet', 'card', 'cash');

-- CreateEnum
CREATE TYPE "FinancialReportType" AS ENUM ('revenue', 'expense', 'summary');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('alert', 'delay', 'route_change', 'emergency', 'promo');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('open', 'in_progress', 'closed');

-- CreateEnum
CREATE TYPE "BusOperationStatus" AS ENUM ('active', 'idle', 'stopped', 'maintenance');

-- CreateEnum
CREATE TYPE "MapLayerType" AS ENUM ('route_overlay', 'heatmap', 'zones');

-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('create', 'update', 'delete');

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_action_id_fkey";

-- DropForeignKey
ALTER TABLE "booking_custom_fields" DROP CONSTRAINT "booking_custom_fields_field_type_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_status_id_fkey";

-- DropForeignKey
ALTER TABLE "bus_custom_fields" DROP CONSTRAINT "bus_custom_fields_field_type_id_fkey";

-- DropForeignKey
ALTER TABLE "bus_status_logs" DROP CONSTRAINT "bus_status_logs_status_id_fkey";

-- DropForeignKey
ALTER TABLE "buses" DROP CONSTRAINT "buses_status_id_fkey";

-- DropForeignKey
ALTER TABLE "driver_custom_fields" DROP CONSTRAINT "driver_custom_fields_field_type_id_fkey";

-- DropForeignKey
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_status_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_reports" DROP CONSTRAINT "financial_reports_report_type_id_fkey";

-- DropForeignKey
ALTER TABLE "map_layers" DROP CONSTRAINT "map_layers_type_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_status_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_type_id_fkey";

-- DropForeignKey
ALTER TABLE "passenger_custom_fields" DROP CONSTRAINT "passenger_custom_fields_field_type_id_fkey";

-- DropForeignKey
ALTER TABLE "passengers" DROP CONSTRAINT "passengers_subscription_status_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_type_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_method_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_status_id_fkey";

-- DropForeignKey
ALTER TABLE "route_custom_fields" DROP CONSTRAINT "route_custom_fields_field_type_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_status_id_fkey";

-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_status_id_fkey";

-- DropForeignKey
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_plan_type_id_fkey";

-- DropForeignKey
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_status_id_fkey";

-- DropForeignKey
ALTER TABLE "trip_custom_fields" DROP CONSTRAINT "trip_custom_fields_field_type_id_fkey";

-- DropForeignKey
ALTER TABLE "trips" DROP CONSTRAINT "trips_status_id_fkey";

-- DropForeignKey
ALTER TABLE "user_custom_fields" DROP CONSTRAINT "user_custom_fields_field_type_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_status_id_fkey";

-- DropIndex
DROP INDEX "access_tokens_refreshToken_key";

-- AlterTable
ALTER TABLE "access_tokens" DROP COLUMN "refreshToken",
ADD COLUMN     "refresh_token" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "action_id",
ADD COLUMN     "action" "AuditActionType" NOT NULL;

-- AlterTable
ALTER TABLE "booking_custom_fields" DROP COLUMN "field_type_id",
ADD COLUMN     "field_type" "FieldType" NOT NULL;

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "status_id",
ADD COLUMN     "status" "BookingStatus" NOT NULL;

-- AlterTable
ALTER TABLE "bus_custom_fields" DROP COLUMN "field_type_id",
ADD COLUMN     "field_type" "FieldType" NOT NULL;

-- AlterTable
ALTER TABLE "bus_status_logs" DROP COLUMN "status_id",
ADD COLUMN     "status" "BusOperationStatus" NOT NULL;

-- AlterTable
ALTER TABLE "buses" DROP COLUMN "status_id",
ADD COLUMN     "status" "BusStatus" NOT NULL;

-- AlterTable
ALTER TABLE "driver_custom_fields" DROP COLUMN "field_type_id",
ADD COLUMN     "field_type" "FieldType" NOT NULL;

-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "status_id",
ADD COLUMN     "status" "DriverStatus" NOT NULL;

-- AlterTable
ALTER TABLE "financial_reports" DROP COLUMN "report_type_id",
ADD COLUMN     "report_type" "FinancialReportType" NOT NULL;

-- AlterTable
ALTER TABLE "map_layers" DROP COLUMN "type_id",
ADD COLUMN     "type" "MapLayerType" NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "status_id",
DROP COLUMN "type_id",
ADD COLUMN     "status" "NotificationStatus" NOT NULL,
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "passenger_custom_fields" DROP COLUMN "field_type_id",
ADD COLUMN     "field_type" "FieldType" NOT NULL;

-- AlterTable
ALTER TABLE "passengers" DROP COLUMN "subscription_status_id",
ADD COLUMN     "subscription_status" "SubscriptionStatus";

-- AlterTable
ALTER TABLE "payment_methods" DROP COLUMN "type_id",
ADD COLUMN     "type" "PaymentMethodEnum" NOT NULL;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "method_id",
DROP COLUMN "status_id",
ADD COLUMN     "method" "PaymentType" NOT NULL,
ADD COLUMN     "status" "PaymentStatus" NOT NULL;

-- AlterTable
ALTER TABLE "route_custom_fields" DROP COLUMN "field_type_id",
ADD COLUMN     "field_type" "FieldType" NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "status_id",
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL;

-- AlterTable
ALTER TABLE "support_tickets" DROP COLUMN "status_id",
ADD COLUMN     "status" "SupportTicketStatus" NOT NULL;

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "plan_type_id",
DROP COLUMN "status_id",
ADD COLUMN     "plan_type" "PlanType" NOT NULL,
ADD COLUMN     "status" "TenantStatus" NOT NULL;

-- AlterTable
ALTER TABLE "trip_custom_fields" DROP COLUMN "field_type_id",
ADD COLUMN     "field_type" "FieldType" NOT NULL;

-- AlterTable
ALTER TABLE "trips" DROP COLUMN "status_id",
ADD COLUMN     "status" "TripStatus" NOT NULL;

-- AlterTable
ALTER TABLE "user_custom_fields" DROP COLUMN "field_type_id",
ADD COLUMN     "field_type" "FieldType" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role_id",
DROP COLUMN "status_id",
ADD COLUMN     "role" "UserRoleEnum" NOT NULL,
ADD COLUMN     "status" "UserStatus" NOT NULL;

-- DropTable
DROP TABLE "audit_action_types";

-- DropTable
DROP TABLE "booking_statuses";

-- DropTable
DROP TABLE "bus_operation_statuses";

-- DropTable
DROP TABLE "bus_statuses";

-- DropTable
DROP TABLE "driver_statuses";

-- DropTable
DROP TABLE "field_types";

-- DropTable
DROP TABLE "financial_report_types";

-- DropTable
DROP TABLE "map_layer_types";

-- DropTable
DROP TABLE "notification_statuses";

-- DropTable
DROP TABLE "notification_types";

-- DropTable
DROP TABLE "payment_methods_enum";

-- DropTable
DROP TABLE "payment_statuses";

-- DropTable
DROP TABLE "payment_types";

-- DropTable
DROP TABLE "plan_types";

-- DropTable
DROP TABLE "subscription_statuses";

-- DropTable
DROP TABLE "support_ticket_statuses";

-- DropTable
DROP TABLE "tenant_statuses";

-- DropTable
DROP TABLE "trip_statuses";

-- DropTable
DROP TABLE "user_roles_enum";

-- DropTable
DROP TABLE "user_statuses";

-- CreateIndex
CREATE UNIQUE INDEX "access_tokens_refresh_token_key" ON "access_tokens"("refresh_token");
