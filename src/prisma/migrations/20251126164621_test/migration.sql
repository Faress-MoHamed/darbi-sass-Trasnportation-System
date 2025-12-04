/*
  Warnings:

  - You are about to drop the `access_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `analytics_kpis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `booking_custom_field_values` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `booking_custom_fields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bookings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bus_custom_field_values` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bus_custom_fields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bus_status_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `buses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `driver_custom_field_values` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `driver_custom_fields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `drivers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `emergency_alerts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `expenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `financial_reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gps_data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loyalty_points` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `map_layers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `otp_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `passenger_custom_field_values` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `passenger_custom_fields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `passengers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_methods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `revenues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `route_custom_field_values` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `route_custom_fields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `routes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `support_replies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `support_tickets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenant_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tickets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trip_custom_field_values` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trip_custom_fields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trip_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trip_performance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trip_stations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trips` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_custom_field_values` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_custom_fields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "access_tokens" DROP CONSTRAINT "access_tokens_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "access_tokens" DROP CONSTRAINT "access_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "analytics_kpis" DROP CONSTRAINT "analytics_kpis_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "booking_custom_field_values" DROP CONSTRAINT "booking_custom_field_values_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "booking_custom_field_values" DROP CONSTRAINT "booking_custom_field_values_custom_field_id_fkey";

-- DropForeignKey
ALTER TABLE "booking_custom_fields" DROP CONSTRAINT "booking_custom_fields_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_trip_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bus_custom_field_values" DROP CONSTRAINT "bus_custom_field_values_bus_id_fkey";

-- DropForeignKey
ALTER TABLE "bus_custom_field_values" DROP CONSTRAINT "bus_custom_field_values_custom_field_id_fkey";

-- DropForeignKey
ALTER TABLE "bus_custom_fields" DROP CONSTRAINT "bus_custom_fields_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "bus_status_logs" DROP CONSTRAINT "bus_status_logs_bus_id_fkey";

-- DropForeignKey
ALTER TABLE "buses" DROP CONSTRAINT "buses_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "driver_custom_field_values" DROP CONSTRAINT "driver_custom_field_values_custom_field_id_fkey";

-- DropForeignKey
ALTER TABLE "driver_custom_field_values" DROP CONSTRAINT "driver_custom_field_values_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "driver_custom_fields" DROP CONSTRAINT "driver_custom_fields_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "emergency_alerts" DROP CONSTRAINT "emergency_alerts_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "emergency_alerts" DROP CONSTRAINT "emergency_alerts_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "emergency_alerts" DROP CONSTRAINT "emergency_alerts_trip_id_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "financial_reports" DROP CONSTRAINT "financial_reports_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "gps_data" DROP CONSTRAINT "gps_data_bus_id_fkey";

-- DropForeignKey
ALTER TABLE "logs" DROP CONSTRAINT "logs_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "logs" DROP CONSTRAINT "logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "loyalty_points" DROP CONSTRAINT "loyalty_points_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "loyalty_points" DROP CONSTRAINT "loyalty_points_user_id_fkey";

-- DropForeignKey
ALTER TABLE "map_layers" DROP CONSTRAINT "map_layers_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_target_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "otp_tokens" DROP CONSTRAINT "otp_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "passenger_custom_field_values" DROP CONSTRAINT "passenger_custom_field_values_custom_field_id_fkey";

-- DropForeignKey
ALTER TABLE "passenger_custom_field_values" DROP CONSTRAINT "passenger_custom_field_values_passenger_id_fkey";

-- DropForeignKey
ALTER TABLE "passenger_custom_fields" DROP CONSTRAINT "passenger_custom_fields_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "passengers" DROP CONSTRAINT "passengers_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "passengers" DROP CONSTRAINT "passengers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "revenues" DROP CONSTRAINT "revenues_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "route_custom_field_values" DROP CONSTRAINT "route_custom_field_values_custom_field_id_fkey";

-- DropForeignKey
ALTER TABLE "route_custom_field_values" DROP CONSTRAINT "route_custom_field_values_route_id_fkey";

-- DropForeignKey
ALTER TABLE "route_custom_fields" DROP CONSTRAINT "route_custom_fields_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "settings" DROP CONSTRAINT "settings_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "stations" DROP CONSTRAINT "stations_route_id_fkey";

-- DropForeignKey
ALTER TABLE "stations" DROP CONSTRAINT "stations_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "support_replies" DROP CONSTRAINT "support_replies_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "support_replies" DROP CONSTRAINT "support_replies_ticket_id_fkey";

-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant_settings" DROP CONSTRAINT "tenant_settings_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "trip_custom_field_values" DROP CONSTRAINT "trip_custom_field_values_custom_field_id_fkey";

-- DropForeignKey
ALTER TABLE "trip_custom_field_values" DROP CONSTRAINT "trip_custom_field_values_trip_id_fkey";

-- DropForeignKey
ALTER TABLE "trip_custom_fields" DROP CONSTRAINT "trip_custom_fields_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "trip_logs" DROP CONSTRAINT "trip_logs_trip_id_fkey";

-- DropForeignKey
ALTER TABLE "trip_performance" DROP CONSTRAINT "trip_performance_trip_id_fkey";

-- DropForeignKey
ALTER TABLE "trip_stations" DROP CONSTRAINT "trip_stations_station_id_fkey";

-- DropForeignKey
ALTER TABLE "trip_stations" DROP CONSTRAINT "trip_stations_trip_id_fkey";

-- DropForeignKey
ALTER TABLE "trips" DROP CONSTRAINT "trips_bus_id_fkey";

-- DropForeignKey
ALTER TABLE "trips" DROP CONSTRAINT "trips_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "trips" DROP CONSTRAINT "trips_route_id_fkey";

-- DropForeignKey
ALTER TABLE "trips" DROP CONSTRAINT "trips_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "user_custom_field_values" DROP CONSTRAINT "user_custom_field_values_custom_field_id_fkey";

-- DropForeignKey
ALTER TABLE "user_custom_field_values" DROP CONSTRAINT "user_custom_field_values_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_custom_fields" DROP CONSTRAINT "user_custom_fields_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_tenant_id_fkey";

-- DropTable
DROP TABLE "access_tokens";

-- DropTable
DROP TABLE "analytics_kpis";

-- DropTable
DROP TABLE "attachments";

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "booking_custom_field_values";

-- DropTable
DROP TABLE "booking_custom_fields";

-- DropTable
DROP TABLE "bookings";

-- DropTable
DROP TABLE "bus_custom_field_values";

-- DropTable
DROP TABLE "bus_custom_fields";

-- DropTable
DROP TABLE "bus_status_logs";

-- DropTable
DROP TABLE "buses";

-- DropTable
DROP TABLE "driver_custom_field_values";

-- DropTable
DROP TABLE "driver_custom_fields";

-- DropTable
DROP TABLE "drivers";

-- DropTable
DROP TABLE "emergency_alerts";

-- DropTable
DROP TABLE "expenses";

-- DropTable
DROP TABLE "financial_reports";

-- DropTable
DROP TABLE "gps_data";

-- DropTable
DROP TABLE "logs";

-- DropTable
DROP TABLE "loyalty_points";

-- DropTable
DROP TABLE "map_layers";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "otp_tokens";

-- DropTable
DROP TABLE "passenger_custom_field_values";

-- DropTable
DROP TABLE "passenger_custom_fields";

-- DropTable
DROP TABLE "passengers";

-- DropTable
DROP TABLE "payment_methods";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "revenues";

-- DropTable
DROP TABLE "role_permissions";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "route_custom_field_values";

-- DropTable
DROP TABLE "route_custom_fields";

-- DropTable
DROP TABLE "routes";

-- DropTable
DROP TABLE "settings";

-- DropTable
DROP TABLE "stations";

-- DropTable
DROP TABLE "subscriptions";

-- DropTable
DROP TABLE "support_replies";

-- DropTable
DROP TABLE "support_tickets";

-- DropTable
DROP TABLE "tenant_settings";

-- DropTable
DROP TABLE "tenants";

-- DropTable
DROP TABLE "tickets";

-- DropTable
DROP TABLE "trip_custom_field_values";

-- DropTable
DROP TABLE "trip_custom_fields";

-- DropTable
DROP TABLE "trip_logs";

-- DropTable
DROP TABLE "trip_performance";

-- DropTable
DROP TABLE "trip_stations";

-- DropTable
DROP TABLE "trips";

-- DropTable
DROP TABLE "user_custom_field_values";

-- DropTable
DROP TABLE "user_custom_fields";

-- DropTable
DROP TABLE "user_roles";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "AuditActionType";

-- DropEnum
DROP TYPE "BookingStatus";

-- DropEnum
DROP TYPE "BusOperationStatus";

-- DropEnum
DROP TYPE "BusStatus";

-- DropEnum
DROP TYPE "DriverStatus";

-- DropEnum
DROP TYPE "FieldType";

-- DropEnum
DROP TYPE "FinancialReportType";

-- DropEnum
DROP TYPE "MapLayerType";

-- DropEnum
DROP TYPE "NotificationStatus";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "PaymentMethodEnum";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "PaymentType";

-- DropEnum
DROP TYPE "PlanType";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- DropEnum
DROP TYPE "SupportTicketStatus";

-- DropEnum
DROP TYPE "TenantStatus";

-- DropEnum
DROP TYPE "TripStatus";

-- DropEnum
DROP TYPE "UserRoleEnum";

-- DropEnum
DROP TYPE "UserStatus";
