
### 1. `tenants`

Core table for multi-tenant SaaS architecture. Each tenant represents a separate organization/company using the system with isolated data. Stores company information, subscription plan, and operational status.

الجدول الأساسي لمعمارية الـ SaaS متعدد العملاء. كل عميل (tenant) يمثل شركة أو مؤسسة منفصلة تستخدم النظام مع بيانات معزولة. يخزن معلومات الشركة وخطة الاشتراك وحالة التشغيل.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(150) | NOT NULL | Tenant/company name |
| domain | VARCHAR(150) | | Custom domain |
| plan_type_id | INT | FOREIGN KEY → plan_types.id | Reference to plan type |
| status_id | INT | FOREIGN KEY → tenant_statuses.id | Reference to tenant status |
| created_at | TIMESTAMP | | Registration date |
| updated_at | TIMESTAMP | | Last update timestamp |

---

### 2. `tenant_settings`

Stores custom configuration settings for each tenant. Allows flexible key-value pairs for tenant-specific preferences like default language, timezone, branding colors, etc.

يخزن إعدادات التخصيص لكل عميل. يسمح بأزواج مفتاح-قيمة مرنة للتفضيلات الخاصة بكل عميل مثل اللغة الافتراضية، المنطقة الزمنية، ألوان العلامة التجارية، إلخ.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| key | VARCHAR(100) | NOT NULL | Setting key name |
| value | TEXT | | Setting value |
| updated_at | TIMESTAMP | | Last modification time |

---

### 3. `users`

Central user management table. Stores all system users including admins, supervisors, drivers, and passengers. Contains authentication credentials, profile information, and user status. Linked to tenant for data isolation.

جدول إدارة المستخدمين المركزي. يخزن جميع مستخدمي النظام بما في ذلك المشرفين والسائقين والركاب. يحتوي على بيانات الاعتماد والمعلومات الشخصية وحالة المستخدم. مرتبط بالعميل لعزل البيانات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| role_id | INT | FOREIGN KEY → user_roles_enum.id | Reference to user role |
| name | VARCHAR(150) | NOT NULL | Full name |
| email | VARCHAR(150) | UNIQUE, NOT NULL | Email address |
| phone | VARCHAR(20) | | Phone number |
| password_hash | TEXT | NOT NULL | Hashed password |
| avatar | VARCHAR(255) | | Profile picture URL |
| language | VARCHAR(10) | | Preferred language |
| status_id | INT | FOREIGN KEY → user_statuses.id | Reference to user status |
| last_login | TIMESTAMP | | Last login timestamp |
| created_at | TIMESTAMP | | Registration date |

---

### 4. `roles`

Defines custom roles for access control. Each tenant can create specific roles (e.g., "Fleet Manager", "Route Planner") with customized permissions for their organization.

يحدد الأدوار المخصصة للتحكم في الوصول. يمكن لكل عميل إنشاء أدوار محددة (مثل "مدير الأسطول"، "مخطط المسارات") مع صلاحيات مخصصة لمؤسستهم.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| name | VARCHAR(100) | NOT NULL | Role name |
| description | TEXT | | Role description |

---

### 5. `permissions`

Master list of all available system permissions (e.g., "manage_trips", "view_reports", "edit_routes"). Used for granular access control across the platform.

القائمة الرئيسية لجميع صلاحيات النظام المتاحة (مثل "إدارة الرحلات"، "عرض التقارير"، "تعديل المسارات"). تستخدم للتحكم الدقيق في الوصول عبر المنصة.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| key | VARCHAR(100) | UNIQUE, NOT NULL | Permission key |
| description | TEXT | | Permission description |

---

### 6. `role_permissions`

Junction table linking roles to their assigned permissions. Enables flexible role-based access control (RBAC) by associating multiple permissions with each role.

جدول ربط بين الأدوار والصلاحيات المخصصة لها. يمكّن من التحكم المرن في الوصول القائم على الأدوار (RBAC) عن طريق ربط صلاحيات متعددة بكل دور.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| role_id | INT | FOREIGN KEY → roles.id, PRIMARY KEY (composite) | Reference to role |
| permission_id | INT | FOREIGN KEY → permissions.id, PRIMARY KEY (composite) | Reference to permission |

---

### 7. `user_roles`

Junction table assigning roles to users. A user can have multiple roles, enabling flexible permission management (e.g., a user can be both "Driver" and "Supervisor").

جدول ربط لتعيين الأدوار للمستخدمين. يمكن للمستخدم أن يكون له أدوار متعددة، مما يتيح إدارة مرنة للصلاحيات (مثلاً، المستخدم يمكن أن يكون "سائق" و"مشرف" في نفس الوقت).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | FOREIGN KEY → users.id, PRIMARY KEY (composite) | Reference to user |
| role_id | INT | FOREIGN KEY → roles.id, PRIMARY KEY (composite) | Reference to role |

---

### 8. `logs`

System-wide activity log tracking all important actions. Records who did what, when, and from which IP address. Essential for security auditing and debugging.

سجل نشاط على مستوى النظام يتتبع جميع الإجراءات المهمة. يسجل من فعل ماذا ومتى ومن أي عنوان IP. ضروري للتدقيق الأمني واستكشاف الأخطاء.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| user_id | UUID | FOREIGN KEY → users.id | User who performed action |
| action | VARCHAR(150) | NOT NULL | Action performed |
| entity_type | VARCHAR(100) | | Type of entity affected |
| entity_id | UUID | | ID of affected entity |
| ip_address | VARCHAR(50) | | IP address of user |
| timestamp | TIMESTAMP | NOT NULL | When action occurred |

---

## Transport Management | إدارة النقل

### 9. `drivers`

Stores driver-specific information including license details, vehicle type, current availability status, and performance rating. Links to the users table for authentication and profile data.

يخزن معلومات السائق الخاصة بما في ذلك تفاصيل الرخصة ونوع المركبة وحالة التوفر الحالية وتقييم الأداء. يرتبط بجدول المستخدمين للمصادقة وبيانات الملف الشخصي.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| user_id | UUID | FOREIGN KEY → users.id | Reference to user account |
| license_number | VARCHAR(50) | NOT NULL | Driver's license number |
| vehicle_type | VARCHAR(50) | | Type of vehicle assigned |
| status_id | INT | FOREIGN KEY → driver_statuses.id | Reference to driver status |
| rating | DECIMAL(2,1) | | Driver rating (0.0-5.0) |
| connected | BOOLEAN | DEFAULT FALSE | Online/offline status |

---

### 10. `buses`

Complete bus/vehicle registry. Contains vehicle identification, capacity, type, operational status, GPS tracker information, and maintenance records. Central to fleet management.

سجل كامل للحافلات/المركبات. يحتوي على تعريف المركبة والسعة والنوع وحالة التشغيل ومعلومات جهاز التتبع بـ GPS وسجلات الصيانة. محوري لإدارة الأسطول.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| bus_number | VARCHAR(50) | UNIQUE, NOT NULL | Bus identification number |
| capacity | INT | NOT NULL | Passenger capacity |
| type | VARCHAR(50) | | Bus type/model |
| status_id | INT | FOREIGN KEY → bus_statuses.id | Reference to bus status |
| gps_tracker_id | VARCHAR(100) | | GPS device identifier |
| maintenance_status | VARCHAR(100) | | Current maintenance status |

---

### 11. `routes`

Defines transportation routes with name, total distance, estimated travel time, and active status. Routes are composed of multiple stations in sequence.

يحدد مسارات النقل مع الاسم والمسافة الإجمالية والوقت المقدر للرحلة وحالة التفعيل. تتكون المسارات من محطات متعددة بالتسلسل.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| name | VARCHAR(150) | NOT NULL | Route name |
| distance_km | DECIMAL(6,2) | | Total route distance in km |
| estimated_time | TIME | | Estimated travel time |
| active | BOOLEAN | DEFAULT TRUE | Route active status |

---

### 12. `stations`

Geographic waypoints along routes. Stores station name, GPS coordinates (latitude/longitude), associated route, and sequence order in the route.

نقاط المرور الجغرافية على طول المسارات. يخزن اسم المحطة والإحداثيات الجغرافية (خط العرض/الطول) والمسار المرتبط وترتيب التسلسل في المسار.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| name | VARCHAR(150) | NOT NULL | Station name |
| latitude | DECIMAL(10,6) | NOT NULL | GPS latitude coordinate |
| longitude | DECIMAL(10,6) | NOT NULL | GPS longitude coordinate |
| route_id | UUID | FOREIGN KEY → routes.id | Reference to route |
| sequence | INT | NOT NULL | Order in route |

---

### 13. `trips`

Individual journey instances. Links a specific bus, driver, and route with departure/arrival times, current status, available seats, and notes. Core operational table.

حالات الرحلات الفردية. يربط حافلة معينة وسائق ومسار مع أوقات المغادرة/الوصول والحالة الحالية والمقاعد المتاحة والملاحظات. جدول تشغيلي أساسي.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| route_id | UUID | FOREIGN KEY → routes.id | Reference to route |
| bus_id | UUID | FOREIGN KEY → buses.id | Reference to bus |
| driver_id | UUID | FOREIGN KEY → drivers.id | Reference to driver |
| departure_time | TIMESTAMP | NOT NULL | Scheduled departure |
| arrival_time | TIMESTAMP | | Scheduled arrival |
| status_id | INT | FOREIGN KEY → trip_statuses.id | Reference to trip status |
| available_seats | INT | | Current available seats |
| notes | TEXT | | Additional notes |

---

### 14. `trip_stations`

Tracks trip progress through each station. Records scheduled vs actual arrival/departure times for each station on a trip, enabling delay tracking and performance analysis.

يتتبع تقدم الرحلة عبر كل محطة. يسجل أوقات الوصول/المغادرة المجدولة مقابل الفعلية لكل محطة في الرحلة، مما يتيح تتبع التأخيرات وتحليل الأداء.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| trip_id | UUID | FOREIGN KEY → trips.id, PRIMARY KEY (composite) | Reference to trip |
| station_id | UUID | FOREIGN KEY → stations.id, PRIMARY KEY (composite) | Reference to station |
| scheduled_arrival_time | TIMESTAMP | | Planned arrival time |
| actual_arrival_time | TIMESTAMP | | Actual arrival time |
| departure_time | TIMESTAMP | | Departure from station |

---

### 15. `trip_logs`

Real-time trip telemetry data. Captures bus location coordinates, speed, and passenger count at regular intervals during active trips for live tracking and analytics.

بيانات القياس عن بُعد للرحلة في الوقت الفعلي. يلتقط إحداثيات موقع الحافلة والسرعة وعدد الركاب على فترات منتظمة أثناء الرحلات النشطة للتتبع المباشر والتحليلات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| trip_id | UUID | FOREIGN KEY → trips.id | Reference to trip |
| bus_location_lat | DECIMAL(10,6) | NOT NULL | Current latitude |
| bus_location_lng | DECIMAL(10,6) | NOT NULL | Current longitude |
| speed | DECIMAL(5,2) | | Current speed (km/h) |
| passengers_count | INT | | Current passenger count |
| timestamp | TIMESTAMP | NOT NULL | Log timestamp |

---

## Passengers & Bookings | الركاب والحجوزات

### 16. `passengers`

Passenger-specific profiles linked to user accounts. Tracks subscription status and loyalty points balance for reward programs and subscription management.

ملفات تعريف خاصة بالركاب مرتبطة بحسابات المستخدمين. يتتبع حالة الاشتراك ورصيد نقاط الولاء لبرامج المكافآت وإدارة الاشتراكات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| user_id | UUID | FOREIGN KEY → users.id | Reference to user account |
| subscription_status_id | INT | FOREIGN KEY → subscription_statuses.id | Reference to subscription status |
| points_balance | INT | DEFAULT 0 | Loyalty points balance |

---

### 17. `bookings`

Trip reservations made by passengers. Contains seat assignment, booking status, unique ticket number, and payment reference. Links passengers to specific trips.

حجوزات الرحلات التي يقوم بها الركاب. يحتوي على تعيين المقعد وحالة الحجز ورقم التذكرة الفريد ومرجع الدفع. يربط الركاب برحلات محددة.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| trip_id | UUID | FOREIGN KEY → trips.id | Reference to trip |
| user_id | UUID | FOREIGN KEY → users.id | Reference to passenger |
| seat_number | VARCHAR(10) | | Assigned seat number |
| status_id | INT | FOREIGN KEY → booking_statuses.id | Reference to booking status |
| ticket_number | VARCHAR(100) | UNIQUE | Unique ticket identifier |
| booking_date | TIMESTAMP | NOT NULL | When booking was made |
| payment_id | UUID | FOREIGN KEY → payments.id | Reference to payment |

---

### 18. `subscriptions`

Recurring subscription plans for regular passengers. Manages subscription periods, pricing, and status (active/expired/cancelled) for monthly/yearly passes.

خطط اشتراك متكررة للركاب المنتظمين. يدير فترات الاشتراك والأسعار والحالة (نشط/منتهي/ملغى) للتصاريح الشهرية/السنوية.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| user_id | UUID | FOREIGN KEY → users.id | Reference to subscriber |
| plan_name | VARCHAR(100) | NOT NULL | Subscription plan name |
| start_date | DATE | NOT NULL | Subscription start date |
| end_date | DATE | NOT NULL | Subscription end date |
| status_id | INT | FOREIGN KEY → subscription_statuses.id | Reference to subscription status |
| price | DECIMAL(10,2) | NOT NULL | Subscription price |

---

### 19. `tickets`

Digital tickets generated from bookings. Contains unique QR code for validation and timestamp of issuance. Used for ticket verification at boarding.

تذاكر رقمية مولدة من الحجوزات. يحتوي على رمز QR فريد للتحقق وطابع زمني للإصدار. يستخدم للتحقق من التذكرة عند الصعود.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| booking_id | UUID | FOREIGN KEY → bookings.id | Reference to booking |
| qr_code | TEXT | NOT NULL | QR code data |
| issued_at | TIMESTAMP | NOT NULL | Ticket issuance time |

---

### 20. `loyalty_points`

Transaction log for loyalty reward program. Records points earned or spent by passengers with reason and timestamp for complete reward history.

سجل المعاملات لبرنامج مكافآت الولاء. يسجل النقاط المكتسبة أو المنفقة من قبل الركاب مع السبب والطابع الزمني لتاريخ كامل للمكافآت.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| user_id | UUID | FOREIGN KEY → users.id | Reference to passenger |
| points | INT | NOT NULL | Points earned/spent |
| reason | VARCHAR(255) | NOT NULL | Transaction reason |
| created_at | TIMESTAMP | NOT NULL | Transaction timestamp |

---

## Payments & Financial Reports | المدفوعات والتقارير المالية

### 21. `payments`

Complete payment transaction records. Stores amount, payment method (wallet/card/cash), provider details, transaction status, and references for reconciliation and refunds.

سجلات معاملات الدفع الكاملة. يخزن المبلغ وطريقة الدفع (محفظة/بطاقة/نقد) وتفاصيل المزود وحالة المعاملة والمراجع للتسوية والاسترداد.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| user_id | UUID | FOREIGN KEY → users.id | Reference to payer |
| amount | DECIMAL(10,2) | NOT NULL | Payment amount |
| method_id | INT | FOREIGN KEY → payment_types.id | Reference to payment type |
| provider | VARCHAR(50) | | Payment provider name |
| transaction_id | VARCHAR(150) | UNIQUE | External transaction ID |
| status_id | INT | FOREIGN KEY → payment_statuses.id | Reference to payment status |
| created_at | TIMESTAMP | NOT NULL | Payment creation time |
| updated_at | TIMESTAMP | | Last status update |
| reference | VARCHAR(100) | | Payment reference number |
| notes | TEXT | | Additional notes |

---

### 22. `payment_methods`

Saved payment methods for users. Stores tokenized card information (last 4 digits only), wallet details, and default payment preference for quick checkout.

طرق الدفع المحفوظة للمستخدمين. يخزن معلومات البطاقة المرمزة (آخر 4 أرقام فقط) وتفاصيل المحفظة وتفضيل الدفع الافتراضي للدفع السريع.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| user_id | UUID | FOREIGN KEY → users.id | Reference to user |
| type_id | INT | FOREIGN KEY → payment_methods_enum.id | Reference to payment method type |
| provider | VARCHAR(50) | | Provider name |
| last4 | VARCHAR(4) | | Last 4 digits of card |
| token | VARCHAR(255) | | Tokenized card data |
| is_default | BOOLEAN | DEFAULT FALSE | Default payment method |
| created_at | TIMESTAMP | NOT NULL | When method was added |

---

### 23. `revenues`

Daily revenue aggregation table. Summarizes total income and trip count per day for financial reporting and trend analysis.

جدول تجميع الإيرادات اليومية. يلخص إجمالي الدخل وعدد الرحلات لكل يوم لإعداد التقارير المالية وتحليل الاتجاهات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| date | DATE | NOT NULL | Revenue date |
| total_amount | DECIMAL(12,2) | NOT NULL | Total revenue |
| trips_count | INT | NOT NULL | Number of trips |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

---

### 24. `expenses`

Operating expenses tracking. Records all business costs categorized by type (maintenance, fuel, salaries, etc.) with description and date for budget management.

تتبع نفقات التشغيل. يسجل جميع تكاليف العمل مصنفة حسب النوع (صيانة، وقود، رواتب، إلخ) مع الوصف والتاريخ لإدارة الميزانية.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| description | VARCHAR(255) | NOT NULL | Expense description |
| amount | DECIMAL(10,2) | NOT NULL | Expense amount |
| category | VARCHAR(100) | | Expense category |
| date | DATE | NOT NULL | Expense date |
| created_at | TIMESTAMP | NOT NULL | Record creation time |

---

### 25. `financial_reports`

Generated financial report metadata. Stores report type, date range, and file path for accessing revenue/expense/summary reports in PDF or Excel format.

بيانات التقارير المالية المولدة. يخزن نوع التقرير ونطاق التاريخ ومسار الملف للوصول إلى تقارير الإيرادات/النفقات/الملخص بصيغة PDF أو Excel.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| report_type_id | INT | FOREIGN KEY → financial_report_types.id | Reference to report type |
| start_date | DATE | NOT NULL | Report start date |
| end_date | DATE | NOT NULL | Report end date |
| file_path | VARCHAR(255) | | Report file location |
| created_at | TIMESTAMP | NOT NULL | Report generation time |

---

## Notifications & Support | الإشعارات والدعم الفني

### 26. `notifications`

Push notification management system. Handles alerts, delays, route changes, emergencies, and promotions with scheduling capabilities and delivery status tracking.

نظام إدارة الإشعارات الفورية. يتعامل مع التنبيهات والتأخيرات وتغييرات المسار والطوارئ والعروض الترويجية مع إمكانيات الجدولة وتتبع حالة التسليم.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| title | VARCHAR(150) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| type_id | INT | FOREIGN KEY → notification_types.id | Reference to notification type |
| target_user_id | UUID | FOREIGN KEY → users.id | Target recipient |
| scheduled_at | TIMESTAMP | | When to send |
| sent_at | TIMESTAMP | | When actually sent |
| status_id | INT | FOREIGN KEY → notification_statuses.id | Reference to notification status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

---

### 27. `support_tickets`

Customer support ticket system. Users can submit issues or requests with subject, detailed message, and status tracking (open/in progress/closed).

نظام تذاكر دعم العملاء. يمكن للمستخدمين تقديم المشكلات أو الطلبات مع الموضوع والرسالة التفصيلية وتتبع الحالة (مفتوح/قيد التقدم/مغلق).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| user_id | UUID | FOREIGN KEY → users.id | User who created ticket |
| subject | VARCHAR(200) | NOT NULL | Ticket subject |
| message | TEXT | NOT NULL | Ticket description |
| status_id | INT | FOREIGN KEY → support_ticket_statuses.id | Reference to ticket status |
| created_at | TIMESTAMP | NOT NULL | Ticket creation time |
| closed_at | TIMESTAMP | | When ticket was closed |

---

### 28. `support_replies`

Threaded replies to support tickets. Allows back-and-forth communication between users and support staff with message history and timestamps.

ردود متسلسلة على تذاكر الدعم. يتيح التواصل ذهابًا وإيابًا بين المستخدمين وموظفي الدعم مع سجل الرسائل والطوابع الزمنية.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| ticket_id | UUID | FOREIGN KEY → support_tickets.id | Reference to ticket |
| sender_id | UUID | FOREIGN KEY → users.id | Who sent the reply |
| message | TEXT | NOT NULL | Reply message |
| created_at | TIMESTAMP | NOT NULL | Reply timestamp |

---

### 29. `emergency_alerts`

Critical emergency notification system. Drivers can send urgent alerts with location coordinates during incidents requiring immediate attention or assistance.

نظام إشعارات الطوارئ الحرجة. يمكن للسائقين إرسال تنبيهات عاجلة مع إحداثيات الموقع أثناء الحوادث التي تتطلب اهتمامًا أو مساعدة فورية.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| driver_id | UUID | FOREIGN KEY → drivers.id | Driver who sent alert |
| trip_id | UUID | FOREIGN KEY → trips.id | Related trip |
| message | TEXT | NOT NULL | Emergency message |
| location_lat | DECIMAL(10,6) | NOT NULL | Emergency location latitude |
| location_lng | DECIMAL(10,6) | NOT NULL | Emergency location longitude |
| created_at | TIMESTAMP | NOT NULL | Alert timestamp |

---

## Analytics & KPIs | التحليلات والإحصائيات

### 30. `analytics_kpis`

Real-time key performance indicators. Tracks metrics like active buses, daily passengers, revenue trends, and operational efficiency with timestamped values.

مؤشرات الأداء الرئيسية في الوقت الفعلي. يتتبع المقاييس مثل الحافلات النشطة والركاب اليوميين واتجاهات الإيرادات والكفاءة التشغيلية مع القيم المختومة بالوقت.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| metric_name | VARCHAR(100) | NOT NULL | KPI metric name |
| value | DECIMAL(12,2) | NOT NULL | Metric value |
| timestamp | TIMESTAMP | NOT NULL | Measurement timestamp |

---

### 31. `trip_performance`

Historical trip performance analytics. Records delays, cancellations, average occupancy rate, and passenger ratings for each trip to identify improvement areas.

تحليلات أداء الرحلات التاريخية. يسجل التأخيرات والإلغاءات ومتوسط معدل الإشغال وتقييمات الركاب لكل رحلة لتحديد مجالات التحسين.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| trip_id | UUID | FOREIGN KEY → trips.id | Reference to trip |
| delays_count | INT | DEFAULT 0 | Number of delays |
| cancellations_count | INT | DEFAULT 0 | Number of cancellations |
| avg_occupancy | DECIMAL(5,2) | | Average occupancy percentage |
| rating | DECIMAL(2,1) | | Trip rating (0.0-5.0) |
| recorded_at | TIMESTAMP | NOT NULL | Performance record time |

---

## Maps & Tracking | الخرائط والتتبع

### 32. `gps_data`

Raw GPS telemetry from buses. Continuous stream of location coordinates and speed data for real-time tracking, route replay, and geofencing.

بيانات القياس عن بُعد GPS الخام من الحافلات. تدفق مستمر من إحداثيات الموقع وبيانات السرعة للتتبع في الوقت الفعلي وإعادة تشغيل المسار والسياج الجغرافي.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| bus_id | UUID | FOREIGN KEY → buses.id | Reference to bus |
| latitude | DECIMAL(10,6) | NOT NULL | GPS latitude |
| longitude | DECIMAL(10,6) | NOT NULL | GPS longitude |
| speed | DECIMAL(5,2) | | Speed in km/h |
| timestamp | TIMESTAMP | NOT NULL | GPS data timestamp |

---

### 33. `bus_status_logs`

Bus operational status history. Tracks transitions between active, idle, stopped, and maintenance states with timestamps for fleet management and utilization analysis.

سجل حالة تشغيل الحافلة. يتتبع التحولات بين الحالات النشطة والخاملة والمتوقفة والصيانة مع الطوابع الزمنية لإدارة الأسطول وتحليل الاستخدام.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| bus_id | UUID | FOREIGN KEY → buses.id | Reference to bus |
| status_id | INT | FOREIGN KEY → bus_operation_statuses.id | Reference to bus operation status |
| timestamp | TIMESTAMP | NOT NULL | Status change timestamp |

---

### 34. `map_layers`

Custom map visualization layers. Stores GeoJSON data for route overlays, heatmaps, service zones, and other geographic visualizations with visibility controls.

طبقات تصور الخرائط المخصصة. يخزن بيانات GeoJSON لتراكبات المسار والخرائط الحرارية ومناطق الخدمة والتصورات الجغرافية الأخرى مع عناصر التحكم في الرؤية.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| type_id | INT | FOREIGN KEY → map_layer_types.id | Reference to map layer type |
| data | JSON | NOT NULL | GeoJSON layer data |
| visible | BOOLEAN | DEFAULT TRUE | Layer visibility |
| updated_at | TIMESTAMP | | Last update time |

---

## Helper Tables | الجداول المساعدة

### 35. `audit_logs`

Comprehensive audit trail for compliance. Records all create/update/delete operations with before and after data snapshots in JSON format for complete change history.

مسار تدقيق شامل للامتثال. يسجل جميع عمليات الإنشاء/التحديث/الحذف مع لقطات البيانات قبل وبعد بصيغة JSON لتاريخ تغيير كامل.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| user_id | UUID | FOREIGN KEY → users.id | User who made change |
| entity_type | VARCHAR(100) | NOT NULL | Type of entity changed |
| entity_id | UUID | NOT NULL | ID of entity changed |
| action_id | INT | FOREIGN KEY → audit_action_types.id | Reference to action type |
| old_data | JSON | | Data before change |
| new_data | JSON | | Data after change |
| created_at | TIMESTAMP | NOT NULL | Audit record timestamp |

---

### 36. `settings`

Global system configuration key-value store. Manages application-wide settings that can be changed without code deployment (feature flags, API keys, etc.).

مخزن المفتاح-القيمة لتكوين النظام العالمي. يدير الإعدادات على مستوى التطبيق التي يمكن تغييرها بدون نشر الكود (علامات الميزات، مفاتيح API، إلخ).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| key | VARCHAR(100) | NOT NULL | Setting key |
| value | TEXT | | Setting value |
| updated_at | TIMESTAMP | | Last update time |

---

### 37. `attachments`

Universal file attachment system. Links documents, images, and files to any entity (bus, driver, report, etc.) with file path storage for document management.

نظام المرفقات الشامل. يربط المستندات والصور والملفات بأي كيان (حافلة، سائق، تقرير، إلخ) مع تخزين مسار الملف لإدارة المستندات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| entity_type | VARCHAR(100) | NOT NULL | Type of entity attached to |
| entity_id | UUID | NOT NULL | ID of entity |
| file_path | VARCHAR(255) | NOT NULL | File storage path |
| uploaded_at | TIMESTAMP | NOT NULL | Upload timestamp |

---

## Enum Tables | جداول القيم الثابتة

### System Enums | القيم الثابتة للنظام

#### 38. `plan_types`
Subscription plan types for tenants (basic, pro, enterprise).
أنواع خطط الاشتراك للعملاء (أساسي، احترافي، مؤسسي).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Plan type key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Plan description |

**Values:** `basic`, `pro`, `enterprise`

---

#### 39. `tenant_statuses`
Status values for tenant accounts.
حالات حسابات العملاء.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Status key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Status description |

**Values:** `active`, `suspended`, `inactive`

---

#### 40. `user_roles_enum`
System-defined user role types.
أنواع أدوار المستخدمين المحددة من النظام.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Role key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Role description |

**Values:** `admin`, `supervisor`, `driver`, `passenger`

---

#### 41. `user_statuses`
User account status values.
حالات حسابات المستخدمين.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Status key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Status description |

**Values:** `active`, `banned`, `pending`

---

### Transport Enums | القيم الثابتة للنقل

#### 42. `driver_statuses`
Driver availability status values.
حالات توفر السائقين.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Status key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Status description |

**Values:** `available`, `unavailable`, `offline`

---

#### 43. `bus_statuses`
Bus operational status values.
حالات تشغيل الحافلات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Status key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Status description |

**Values:** `active`, `maintenance`, `stopped`

---

#### 44. `trip_statuses`
Trip lifecycle status values.
حالات دورة حياة الرحلة.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Status key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Status description |

**Values:** `active`, `completed`, `cancelled`

---

#### 45. `bus_operation_statuses`
Detailed bus operational states for logging.
حالات تشغيل الحافلة التفصيلية للتسجيل.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Status key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Status description |

**Values:** `active`, `idle`, `stopped`, `maintenance`

---

### Booking & Payment Enums | القيم الثابتة للحجوزات والمدفوعات

#### 46. `subscription_statuses`
Subscription status values.
حالات الاشتراكات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Status key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Status description |

**Values:** `active`, `expired`, `cancelled`

---

#### 47. `booking_statuses`
Booking status values.
حالات الحجوزات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Status key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Status description |

**Values:** `confirmed`, `cancelled`, `pending`

---

#### 48. `payment_types`
Payment method types.
أنواع طرق الدفع.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Type key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Type description |

**Values:** `wallet`, `card`, `cash`

---

#### 49. `payment_statuses`
Payment transaction status values.
حالات معاملات الدفع.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Status key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Status description |

**Values:** `success`, `failed`, `pending`, `refunded`

---

#### 50. `payment_methods_enum`
Saved payment method types.
أنواع طرق الدفع المحفوظة.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Method key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Method description |

**Values:** `wallet`, `credit_card`, `debit_card`

---

### Notification & Support Enums | القيم الثابتة للإشعارات والدعم

#### 51. `notification_types`
Notification category types.
أنواع فئات الإشعارات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Type key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Type description |

**Values:** `alert`, `delay`, `route_change`, `emergency`, `promo`

---

#### 52. `notification_statuses`
Notification delivery status values.
حالات تسليم الإشعارات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Status key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Status description |

**Values:** `pending`, `sent`, `failed`

---

#### 53. `support_ticket_statuses`
Support ticket status values.
حالات تذاكر الدعم الفني.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Status key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Status description |

**Values:** `open`, `in_progress`, `closed`

---

### Report & Audit Enums | القيم الثابتة للتقارير والتدقيق

#### 54. `financial_report_types`
Financial report category types.
أنواع فئات التقارير المالية.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Type key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Type description |

**Values:** `revenue`, `expense`, `summary`

---

#### 55. `audit_action_types`
Audit log action types.
أنواع إجراءات سجل التدقيق.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Action key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Action description |

**Values:** `create`, `update`, `delete`

---

#### 56. `map_layer_types`
Map visualization layer types.
أنواع طبقات تصور الخرائط.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Type key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Type description |

**Values:** `route_overlay`, `heatmap`, `zones`

---

## Custom Fields System | نظام الحقول المخصصة

The custom fields system allows each tenant to define additional fields for various entities, providing flexibility to extend the data model without schema changes.

يتيح نظام الحقول المخصصة لكل عميل تحديد حقول إضافية لكيانات مختلفة، مما يوفر المرونة لتوسيع نموذج البيانات دون تغييرات في المخطط.

### 57. `field_types`

Defines available field data types for custom fields (text, number, date, file, boolean, select).

يحدد أنواع بيانات الحقول المتاحة للحقول المخصصة (نص، رقم، تاريخ، ملف، منطقي، اختيار).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Field type key |
| label | VARCHAR(100) | | Display label |
| description | TEXT | | Type description |

**Values:** `text`, `number`, `date`, `file`, `boolean`, `select`

---

### User Custom Fields | الحقول المخصصة للمستخدمين

#### 58. `user_custom_fields`

Defines custom field definitions for users per tenant.

يحدد تعريفات الحقول المخصصة للمستخدمين لكل عميل.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| name | VARCHAR(100) | NOT NULL | Field key (e.g., favorite_color) |
| label | VARCHAR(150) | NOT NULL | Display label |
| field_type_id | INT | FOREIGN KEY → field_types.id | Reference to field type |
| required | BOOLEAN | DEFAULT FALSE | Is field required |
| options | JSON | | Options for select fields |
| created_at | TIMESTAMP | | Field creation time |
| updated_at | TIMESTAMP | | Last modification time |

---

#### 59. `user_custom_field_values`

Stores actual values for user custom fields.

يخزن القيم الفعلية للحقول المخصصة للمستخدمين.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| user_id | UUID | FOREIGN KEY → users.id | Reference to user |
| custom_field_id | INT | FOREIGN KEY → user_custom_fields.id | Reference to custom field |
| value | TEXT | | Field value (stored as text) |
| updated_at | TIMESTAMP | | Last update time |

---

### Driver Custom Fields | الحقول المخصصة للسائقين

#### 60. `driver_custom_fields`

Defines custom field definitions for drivers per tenant.

يحدد تعريفات الحقول المخصصة للسائقين لكل عميل.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| name | VARCHAR(100) | NOT NULL | Field key |
| label | VARCHAR(150) | NOT NULL | Display label |
| field_type_id | INT | FOREIGN KEY → field_types.id | Reference to field type |
| required | BOOLEAN | DEFAULT FALSE | Is field required |
| options | JSON | | Options for select fields |
| created_at | TIMESTAMP | | Field creation time |
| updated_at | TIMESTAMP | | Last modification time |

---

#### 61. `driver_custom_field_values`

Stores actual values for driver custom fields.

يخزن القيم الفعلية للحقول المخصصة للسائقين.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| driver_id | UUID | FOREIGN KEY → drivers.id | Reference to driver |
| custom_field_id | INT | FOREIGN KEY → driver_custom_fields.id | Reference to custom field |
| value | TEXT | | Field value (stored as text) |
| updated_at | TIMESTAMP | | Last update time |

---

### Bus Custom Fields | الحقول المخصصة للحافلات

#### 62. `bus_custom_fields`

Defines custom field definitions for buses per tenant.

يحدد تعريفات الحقول المخصصة للحافلات لكل عميل.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| name | VARCHAR(100) | NOT NULL | Field key |
| label | VARCHAR(150) | NOT NULL | Display label |
| field_type_id | INT | FOREIGN KEY → field_types.id | Reference to field type |
| required | BOOLEAN | DEFAULT FALSE | Is field required |
| options | JSON | | Options for select fields |
| created_at | TIMESTAMP | | Field creation time |
| updated_at | TIMESTAMP | | Last modification time |

---

#### 63. `bus_custom_field_values`

Stores actual values for bus custom fields.

يخزن القيم الفعلية للحقول المخصصة للحافلات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| bus_id | UUID | FOREIGN KEY → buses.id | Reference to bus |
| custom_field_id | INT | FOREIGN KEY → bus_custom_fields.id | Reference to custom field |
| value | TEXT | | Field value (stored as text) |
| updated_at | TIMESTAMP | | Last update time |

---

### Passenger Custom Fields | الحقول المخصصة للركاب

#### 64. `passenger_custom_fields`

Defines custom field definitions for passengers per tenant.

يحدد تعريفات الحقول المخصصة للركاب لكل عميل.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| name | VARCHAR(100) | NOT NULL | Field key |
| label | VARCHAR(150) | NOT NULL | Display label |
| field_type_id | INT | FOREIGN KEY → field_types.id | Reference to field type |
| required | BOOLEAN | DEFAULT FALSE | Is field required |
| options | JSON | | Options for select fields |
| created_at | TIMESTAMP | | Field creation time |
| updated_at | TIMESTAMP | | Last modification time |

---

#### 65. `passenger_custom_field_values`

Stores actual values for passenger custom fields.

يخزن القيم الفعلية للحقول المخصصة للركاب.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| passenger_id | UUID | FOREIGN KEY → passengers.id | Reference to passenger |
| custom_field_id | INT | FOREIGN KEY → passenger_custom_fields.id | Reference to custom field |
| value | TEXT | | Field value (stored as text) |
| updated_at | TIMESTAMP | | Last update time |

---

### Trip Custom Fields | الحقول المخصصة للرحلات

#### 66. `trip_custom_fields`

Defines custom field definitions for trips per tenant.

يحدد تعريفات الحقول المخصصة للرحلات لكل عميل.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| name | VARCHAR(100) | NOT NULL | Field key |
| label | VARCHAR(150) | NOT NULL | Display label |
| field_type_id | INT | FOREIGN KEY → field_types.id | Reference to field type |
| required | BOOLEAN | DEFAULT FALSE | Is field required |
| options | JSON | | Options for select fields |
| created_at | TIMESTAMP | | Field creation time |
| updated_at | TIMESTAMP | | Last modification time |

---

#### 67. `trip_custom_field_values`

Stores actual values for trip custom fields.

يخزن القيم الفعلية للحقول المخصصة للرحلات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| trip_id | UUID | FOREIGN KEY → trips.id | Reference to trip |
| custom_field_id | INT | FOREIGN KEY → trip_custom_fields.id | Reference to custom field |
| value | TEXT | | Field value (stored as text) |
| updated_at | TIMESTAMP | | Last update time |

---

### Booking Custom Fields | الحقول المخصصة للحجوزات

#### 68. `booking_custom_fields`

Defines custom field definitions for bookings per tenant.

يحدد تعريفات الحقول المخصصة للحجوزات لكل عميل.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| name | VARCHAR(100) | NOT NULL | Field key |
| label | VARCHAR(150) | NOT NULL | Display label |
| field_type_id | INT | FOREIGN KEY → field_types.id | Reference to field type |
| required | BOOLEAN | DEFAULT FALSE | Is field required |
| options | JSON | | Options for select fields |
| created_at | TIMESTAMP | | Field creation time |
| updated_at | TIMESTAMP | | Last modification time |

---

#### 69. `booking_custom_field_values`

Stores actual values for booking custom fields.

يخزن القيم الفعلية للحقول المخصصة للحجوزات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| booking_id | UUID | FOREIGN KEY → bookings.id | Reference to booking |
| custom_field_id | INT | FOREIGN KEY → booking_custom_fields.id | Reference to custom field |
| value | TEXT | | Field value (stored as text) |
| updated_at | TIMESTAMP | | Last update time |

---

### Route Custom Fields | الحقول المخصصة للمسارات

#### 70. `route_custom_fields`

Defines custom field definitions for routes per tenant.

يحدد تعريفات الحقول المخصصة للمسارات لكل عميل.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| tenant_id | UUID | FOREIGN KEY → tenants.id | Reference to tenant |
| name | VARCHAR(100) | NOT NULL | Field key |
| label | VARCHAR(150) | NOT NULL | Display label |
| field_type_id | INT | FOREIGN KEY → field_types.id | Reference to field type |
| required | BOOLEAN | DEFAULT FALSE | Is field required |
| options | JSON | | Options for select fields |
| created_at | TIMESTAMP | | Field creation time |
| updated_at | TIMESTAMP | | Last modification time |

---


#### 71. `route_custom_field_values`

Stores actual values for route custom fields.

يخزن القيم الفعلية للحقول المخصصة للمسارات.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| route_id | UUID | FOREIGN KEY → routes.id | Reference to route |
| custom_field_id | INT | FOREIGN KEY → route_custom_fields.id | Reference to custom field |
| value | TEXT | | Field value (stored as text) |
| updated_at | TIMESTAMP | | Last update time |

---
