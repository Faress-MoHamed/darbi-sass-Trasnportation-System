export const PERMISSIONS = {
	// User Management
	USERS_VIEW: "users.view",
	USERS_CREATE: "users.create",
	USERS_UPDATE: "users.update",
	USERS_DELETE: "users.delete",
	USERS_MANAGE_ROLES: "users.manage_roles",
	USERS_MANAGE_STATUS: "users.manage_status",
	USERS_RESET_PASSWORD: "users.reset_password",
	USERS_VIEW_ACTIVITY: "users.view_activity",

	// Role & Permission Management
	ROLES_VIEW: "roles.view",
	ROLES_CREATE: "roles.create",
	ROLES_UPDATE: "roles.update",
	ROLES_DELETE: "roles.delete",
	PERMISSIONS_MANAGE: "permissions.manage",

	// Driver Management
	DRIVERS_VIEW: "drivers.view",
	DRIVERS_CREATE: "drivers.create",
	DRIVERS_UPDATE: "drivers.update",
	DRIVERS_DELETE: "drivers.delete",
	DRIVERS_MANAGE_STATUS: "drivers.manage_status",
	DRIVERS_VIEW_PERFORMANCE: "drivers.view_performance",
	DRIVERS_ASSIGN_TRIPS: "drivers.assign_trips",

	// Bus Management
	BUSES_VIEW: "buses.view",
	BUSES_CREATE: "buses.create",
	BUSES_UPDATE: "buses.update",
	BUSES_DELETE: "buses.delete",
	BUSES_MANAGE_STATUS: "buses.manage_status",
	BUSES_VIEW_GPS: "buses.view_gps",
	BUSES_MANAGE_MAINTENANCE: "buses.manage_maintenance",

	// Route Management
	ROUTES_VIEW: "routes.view",
	ROUTES_CREATE: "routes.create",
	ROUTES_UPDATE: "routes.update",
	ROUTES_DELETE: "routes.delete",
	ROUTES_MANAGE_STATIONS: "routes.manage_stations",
	ROUTES_ACTIVATE_DEACTIVATE: "routes.activate_deactivate",

	// Station Management
	STATIONS_VIEW: "stations.view",
	STATIONS_CREATE: "stations.create",
	STATIONS_UPDATE: "stations.update",
	STATIONS_DELETE: "stations.delete",

	// Trip Management
	TRIPS_VIEW: "trips.view",
	TRIPS_CREATE: "trips.create",
	TRIPS_UPDATE: "trips.update",
	TRIPS_DELETE: "trips.delete",
	TRIPS_MANAGE_STATUS: "trips.manage_status",
	TRIPS_VIEW_LOGS: "trips.view_logs",
	TRIPS_VIEW_PERFORMANCE: "trips.view_performance",

	// Passenger Management
	PASSENGERS_VIEW: "passengers.view",
	PASSENGERS_CREATE: "passengers.create",
	PASSENGERS_UPDATE: "passengers.update",
	PASSENGERS_DELETE: "passengers.delete",
	PASSENGERS_MANAGE_SUBSCRIPTIONS: "passengers.manage_subscriptions",
	PASSENGERS_MANAGE_LOYALTY: "passengers.manage_loyalty",

	// Booking Management
	BOOKINGS_VIEW: "bookings.view",
	BOOKINGS_CREATE: "bookings.create",
	BOOKINGS_UPDATE: "bookings.update",
	BOOKINGS_DELETE: "bookings.delete",
	BOOKINGS_CANCEL: "bookings.cancel",
	BOOKINGS_CONFIRM: "bookings.confirm",

	// Ticket Management
	TICKETS_VIEW: "tickets.view",
	TICKETS_ISSUE: "tickets.issue",
	TICKETS_VERIFY: "tickets.verify",
	TICKETS_VOID: "tickets.void",

	// Payment Management
	PAYMENTS_VIEW: "payments.view",
	PAYMENTS_PROCESS: "payments.process",
	PAYMENTS_REFUND: "payments.refund",
	PAYMENTS_VIEW_METHODS: "payments.view_methods",
	PAYMENTS_MANAGE_METHODS: "payments.manage_methods",

	// Financial Management
	FINANCE_VIEW_REVENUE: "finance.view_revenue",
	FINANCE_VIEW_EXPENSES: "finance.view_expenses",
	FINANCE_MANAGE_EXPENSES: "finance.manage_expenses",
	FINANCE_GENERATE_REPORTS: "finance.generate_reports",
	FINANCE_EXPORT_REPORTS: "finance.export_reports",

	// Notification Management
	NOTIFICATIONS_VIEW: "notifications.view",
	NOTIFICATIONS_CREATE: "notifications.create",
	NOTIFICATIONS_SCHEDULE: "notifications.schedule",
	NOTIFICATIONS_DELETE: "notifications.delete",

	// Support Ticket Management
	SUPPORT_VIEW_TICKETS: "support.view_tickets",
	SUPPORT_CREATE_TICKET: "support.create_ticket",
	SUPPORT_REPLY_TICKET: "support.reply_ticket",
	SUPPORT_MANAGE_STATUS: "support.manage_status",
	SUPPORT_CLOSE_TICKET: "support.close_ticket",

	// Emergency Alert Management
	EMERGENCY_VIEW_ALERTS: "emergency.view_alerts",
	EMERGENCY_CREATE_ALERT: "emergency.create_alert",
	EMERGENCY_RESPOND: "emergency.respond",

	// Analytics & Reports
	ANALYTICS_VIEW_DASHBOARD: "analytics.view_dashboard",
	ANALYTICS_VIEW_KPIS: "analytics.view_kpis",
	ANALYTICS_VIEW_REPORTS: "analytics.view_reports",
	ANALYTICS_EXPORT_DATA: "analytics.export_data",

	// Map & Tracking
	MAPS_VIEW: "maps.view",
	MAPS_TRACK_BUSES: "maps.track_buses",
	MAPS_MANAGE_LAYERS: "maps.manage_layers",
	MAPS_VIEW_GPS_HISTORY: "maps.view_gps_history",

	// Custom Fields Management
	CUSTOM_FIELDS_VIEW: "custom_fields.view",
	CUSTOM_FIELDS_CREATE: "custom_fields.create",
	CUSTOM_FIELDS_UPDATE: "custom_fields.update",
	CUSTOM_FIELDS_DELETE: "custom_fields.delete",

	// Tenant Settings
	SETTINGS_VIEW: "settings.view",
	SETTINGS_UPDATE: "settings.update",
	SETTINGS_MANAGE_PLAN: "settings.manage_plan",

	// Audit & Logs
	AUDIT_VIEW_LOGS: "audit.view_logs",
	AUDIT_EXPORT_LOGS: "audit.export_logs",
	LOGS_VIEW: "logs.view",

	// Attachment Management
	ATTACHMENTS_VIEW: "attachments.view",
	ATTACHMENTS_UPLOAD: "attachments.upload",
	ATTACHMENTS_DELETE: "attachments.delete",

	// Subscription Management
	SUBSCRIPTIONS_VIEW: "subscriptions.view",
	SUBSCRIPTIONS_CREATE: "subscriptions.create",
	SUBSCRIPTIONS_UPDATE: "subscriptions.update",
	SUBSCRIPTIONS_CANCEL: "subscriptions.cancel",

	// System Administration
	SYSTEM_FULL_ACCESS: "system.full_access",
	SYSTEM_MANAGE_TENANTS: "system.manage_tenants",
	SYSTEM_VIEW_ALL_DATA: "system.view_all_data",

	SUPER_ADMIN: "super_admin",
} as const;

// Create a type from the permission values
export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Permission descriptions for seeding
export const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
	// User Management
	[PERMISSIONS.USERS_VIEW]: "View users list and details",
	[PERMISSIONS.USERS_CREATE]: "Create new users",
	[PERMISSIONS.USERS_UPDATE]: "Update user information",
	[PERMISSIONS.USERS_DELETE]: "Delete users",
	[PERMISSIONS.USERS_MANAGE_ROLES]: "Assign and manage user roles",
	[PERMISSIONS.USERS_MANAGE_STATUS]: "Activate, ban, or suspend users",
	[PERMISSIONS.USERS_RESET_PASSWORD]: "Reset user passwords",
	[PERMISSIONS.USERS_VIEW_ACTIVITY]: "View user activity logs",

	// Role & Permission Management
	[PERMISSIONS.ROLES_VIEW]: "View roles list and details",
	[PERMISSIONS.ROLES_CREATE]: "Create new roles",
	[PERMISSIONS.ROLES_UPDATE]: "Update role information",
	[PERMISSIONS.ROLES_DELETE]: "Delete roles",
	[PERMISSIONS.PERMISSIONS_MANAGE]: "Manage role permissions",

	// Driver Management
	[PERMISSIONS.DRIVERS_VIEW]: "View drivers list and details",
	[PERMISSIONS.DRIVERS_CREATE]: "Create new drivers",
	[PERMISSIONS.DRIVERS_UPDATE]: "Update driver information",
	[PERMISSIONS.DRIVERS_DELETE]: "Delete drivers",
	[PERMISSIONS.DRIVERS_MANAGE_STATUS]: "Change driver availability status",
	[PERMISSIONS.DRIVERS_VIEW_PERFORMANCE]: "View driver performance metrics",
	[PERMISSIONS.DRIVERS_ASSIGN_TRIPS]: "Assign trips to drivers",

	// Bus Management
	[PERMISSIONS.BUSES_VIEW]: "View buses list and details",
	[PERMISSIONS.BUSES_CREATE]: "Create new buses",
	[PERMISSIONS.BUSES_UPDATE]: "Update bus information",
	[PERMISSIONS.BUSES_DELETE]: "Delete buses",
	[PERMISSIONS.BUSES_MANAGE_STATUS]:
		"Change bus status (active, maintenance, stopped)",
	[PERMISSIONS.BUSES_VIEW_GPS]: "View real-time GPS tracking data",
	[PERMISSIONS.BUSES_MANAGE_MAINTENANCE]: "Manage bus maintenance records",

	// Route Management
	[PERMISSIONS.ROUTES_VIEW]: "View routes list and details",
	[PERMISSIONS.ROUTES_CREATE]: "Create new routes",
	[PERMISSIONS.ROUTES_UPDATE]: "Update route information",
	[PERMISSIONS.ROUTES_DELETE]: "Delete routes",
	[PERMISSIONS.ROUTES_MANAGE_STATIONS]: "Add or remove stations from routes",
	[PERMISSIONS.ROUTES_ACTIVATE_DEACTIVATE]: "Activate or deactivate routes",

	// Station Management
	[PERMISSIONS.STATIONS_VIEW]: "View stations list and details",
	[PERMISSIONS.STATIONS_CREATE]: "Create new stations",
	[PERMISSIONS.STATIONS_UPDATE]: "Update station information",
	[PERMISSIONS.STATIONS_DELETE]: "Delete stations",

	// Trip Management
	[PERMISSIONS.TRIPS_VIEW]: "View trips list and details",
	[PERMISSIONS.TRIPS_CREATE]: "Create new trips",
	[PERMISSIONS.TRIPS_UPDATE]: "Update trip information",
	[PERMISSIONS.TRIPS_DELETE]: "Delete trips",
	[PERMISSIONS.TRIPS_MANAGE_STATUS]:
		"Change trip status (active, completed, cancelled)",
	[PERMISSIONS.TRIPS_VIEW_LOGS]: "View trip logs and tracking history",
	[PERMISSIONS.TRIPS_VIEW_PERFORMANCE]: "View trip performance metrics",

	// Passenger Management
	[PERMISSIONS.PASSENGERS_VIEW]: "View passengers list and details",
	[PERMISSIONS.PASSENGERS_CREATE]: "Create new passengers",
	[PERMISSIONS.PASSENGERS_UPDATE]: "Update passenger information",
	[PERMISSIONS.PASSENGERS_DELETE]: "Delete passengers",
	[PERMISSIONS.PASSENGERS_MANAGE_SUBSCRIPTIONS]:
		"Manage passenger subscriptions",
	[PERMISSIONS.PASSENGERS_MANAGE_LOYALTY]: "Manage loyalty points",

	// Booking Management
	[PERMISSIONS.BOOKINGS_VIEW]: "View bookings list and details",
	[PERMISSIONS.BOOKINGS_CREATE]: "Create new bookings",
	[PERMISSIONS.BOOKINGS_UPDATE]: "Update booking information",
	[PERMISSIONS.BOOKINGS_DELETE]: "Delete bookings",
	[PERMISSIONS.BOOKINGS_CANCEL]: "Cancel bookings",
	[PERMISSIONS.BOOKINGS_CONFIRM]: "Confirm pending bookings",

	// Ticket Management
	[PERMISSIONS.TICKETS_VIEW]: "View tickets list and details",
	[PERMISSIONS.TICKETS_ISSUE]: "Issue new tickets",
	[PERMISSIONS.TICKETS_VERIFY]: "Verify ticket QR codes",
	[PERMISSIONS.TICKETS_VOID]: "Void or cancel tickets",

	// Payment Management
	[PERMISSIONS.PAYMENTS_VIEW]: "View payments list and details",
	[PERMISSIONS.PAYMENTS_PROCESS]: "Process new payments",
	[PERMISSIONS.PAYMENTS_REFUND]: "Process payment refunds",
	[PERMISSIONS.PAYMENTS_VIEW_METHODS]: "View saved payment methods",
	[PERMISSIONS.PAYMENTS_MANAGE_METHODS]: "Add or remove payment methods",

	// Financial Management
	[PERMISSIONS.FINANCE_VIEW_REVENUE]: "View revenue reports",
	[PERMISSIONS.FINANCE_VIEW_EXPENSES]: "View expense reports",
	[PERMISSIONS.FINANCE_MANAGE_EXPENSES]: "Create and manage expenses",
	[PERMISSIONS.FINANCE_GENERATE_REPORTS]: "Generate financial reports",
	[PERMISSIONS.FINANCE_EXPORT_REPORTS]: "Export financial reports",

	// Notification Management
	[PERMISSIONS.NOTIFICATIONS_VIEW]: "View notifications list",
	[PERMISSIONS.NOTIFICATIONS_CREATE]: "Create and send notifications",
	[PERMISSIONS.NOTIFICATIONS_SCHEDULE]: "Schedule future notifications",
	[PERMISSIONS.NOTIFICATIONS_DELETE]: "Delete notifications",

	// Support Ticket Management
	[PERMISSIONS.SUPPORT_VIEW_TICKETS]: "View support tickets",
	[PERMISSIONS.SUPPORT_CREATE_TICKET]: "Create new support tickets",
	[PERMISSIONS.SUPPORT_REPLY_TICKET]: "Reply to support tickets",
	[PERMISSIONS.SUPPORT_MANAGE_STATUS]: "Update ticket status",
	[PERMISSIONS.SUPPORT_CLOSE_TICKET]: "Close support tickets",

	// Emergency Alert Management
	[PERMISSIONS.EMERGENCY_VIEW_ALERTS]: "View emergency alerts",
	[PERMISSIONS.EMERGENCY_CREATE_ALERT]: "Create emergency alerts",
	[PERMISSIONS.EMERGENCY_RESPOND]: "Respond to emergency alerts",

	// Analytics & Reports
	[PERMISSIONS.ANALYTICS_VIEW_DASHBOARD]: "View analytics dashboard",
	[PERMISSIONS.ANALYTICS_VIEW_KPIS]: "View key performance indicators",
	[PERMISSIONS.ANALYTICS_VIEW_REPORTS]: "View analytical reports",
	[PERMISSIONS.ANALYTICS_EXPORT_DATA]: "Export analytics data",

	// Map & Tracking
	[PERMISSIONS.MAPS_VIEW]: "View map interface",
	[PERMISSIONS.MAPS_TRACK_BUSES]: "Track buses in real-time",
	[PERMISSIONS.MAPS_MANAGE_LAYERS]: "Manage map layers",
	[PERMISSIONS.MAPS_VIEW_GPS_HISTORY]: "View GPS tracking history",

	// Custom Fields Management
	[PERMISSIONS.CUSTOM_FIELDS_VIEW]: "View custom fields configuration",
	[PERMISSIONS.CUSTOM_FIELDS_CREATE]: "Create new custom fields",
	[PERMISSIONS.CUSTOM_FIELDS_UPDATE]: "Update custom fields",
	[PERMISSIONS.CUSTOM_FIELDS_DELETE]: "Delete custom fields",

	// Tenant Settings
	[PERMISSIONS.SETTINGS_VIEW]: "View tenant settings",
	[PERMISSIONS.SETTINGS_UPDATE]: "Update tenant settings",
	[PERMISSIONS.SETTINGS_MANAGE_PLAN]: "Manage tenant subscription plan",

	// Audit & Logs
	[PERMISSIONS.AUDIT_VIEW_LOGS]: "View audit logs",
	[PERMISSIONS.AUDIT_EXPORT_LOGS]: "Export audit logs",
	[PERMISSIONS.LOGS_VIEW]: "View system logs",

	// Attachment Management
	[PERMISSIONS.ATTACHMENTS_VIEW]: "View attachments",
	[PERMISSIONS.ATTACHMENTS_UPLOAD]: "Upload new attachments",
	[PERMISSIONS.ATTACHMENTS_DELETE]: "Delete attachments",

	// Subscription Management
	[PERMISSIONS.SUBSCRIPTIONS_VIEW]: "View subscriptions",
	[PERMISSIONS.SUBSCRIPTIONS_CREATE]: "Create new subscriptions",
	[PERMISSIONS.SUBSCRIPTIONS_UPDATE]: "Update subscription details",
	[PERMISSIONS.SUBSCRIPTIONS_CANCEL]: "Cancel subscriptions",

	// System Administration
	[PERMISSIONS.SYSTEM_FULL_ACCESS]: "Full system access (SuperAdmin only)",
	[PERMISSIONS.SYSTEM_MANAGE_TENANTS]: "Manage tenant accounts",
	[PERMISSIONS.SYSTEM_VIEW_ALL_DATA]: "View data across all tenants",

	[PERMISSIONS.SUPER_ADMIN]: "the owners of this application",
};

// Helper function to get all permissions for seeding
export function getAllPermissions() {
	return Object.values(PERMISSIONS).map((key) => ({
		key,
		description: PERMISSION_DESCRIPTIONS[key],
	}));
}
