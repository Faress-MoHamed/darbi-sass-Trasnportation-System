# 🚌 Smart Transport SaaS - Database Schema Documentation

## Overview | نظرة عامة

This document provides a comprehensive overview of the database schema for a multi-tenant SaaS transportation management system. The schema is designed to support multiple organizations (tenants) with isolated data, flexible custom fields, and normalized enum tables for better maintainability.

يوفر هذا المستند نظرة شاملة على مخطط قاعدة البيانات لنظام SaaS متعدد العملاء لإدارة النقل. تم تصميم المخطط لدعم مؤسسات متعددة (عملاء) مع بيانات معزولة وحقول مخصصة مرنة وجداول قيم ثابتة منظمة لصيانة أفضل.

---


## Database Design Principles | مبادئ تصميم قاعدة البيانات

### Multi-Tenancy | التعددية للعملاء

The schema implements **row-level multi-tenancy** where:
- Almost all tables include a `tenant_id` foreign key
- Data isolation is enforced at the application level
- Each tenant's data is completely separated from others
- Queries must always filter by `tenant_id`

يطبق المخطط **التعددية على مستوى الصف** حيث:
- تحتوي جميع الجداول تقريبًا على مفتاح خارجي `tenant_id`
- يتم فرض عزل البيانات على مستوى التطبيق
- بيانات كل عميل منفصلة تمامًا عن الآخرين
- يجب أن تقوم الاستعلامات دائمًا بالتصفية حسب `tenant_id`

---

### Normalized Enums | القيم الثابتة المنظمة

Instead of using VARCHAR fields for status values, the schema uses **normalized enum tables**:

بدلاً من استخدام حقول VARCHAR لقيم الحالة، يستخدم المخطط **جداول قيم ثابتة منظمة**:

**Benefits | الفوائد:**
- **Type Safety**: Prevents invalid status values
- **Internationalization**: Easy to add translations via `label` field
- **Maintainability**: Centralized management of enum values
- **Flexibility**: Can add metadata (description, color codes, etc.)
- **Data Integrity**: Foreign key constraints ensure referential integrity

**Example Pattern:**
```sql
-- Enum table
CREATE TABLE trip_statuses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,  -- 'active', 'completed', 'cancelled'
  label VARCHAR(100),                 -- Display name
  description TEXT
);

-- Usage in main table
CREATE TABLE trips (
  ...
  status_id INT,
  FOREIGN KEY (status_id) REFERENCES trip_statuses(id)
);
```

---

### Custom Fields Architecture | معمارية الحقول المخصصة

The **Entity-Attribute-Value (EAV)** pattern allows tenants to extend entities dynamically:

يتيح نمط **الكيان-السمة-القيمة (EAV)** للعملاء توسيع الكيانات ديناميكيًا:

**Structure | البنية:**
1. **Field Definition Tables**: Define custom fields per entity type
   - `user_custom_fields`, `driver_custom_fields`, etc.
   - Each tenant creates their own field definitions
   - Includes field metadata (type, label, required, options)

2. **Field Value Tables**: Store actual values for each entity instance
   - `user_custom_field_values`, `driver_custom_field_values`, etc.
   - All values stored as TEXT for flexibility
   - Type casting handled at application layer

**Use Cases | حالات الاستخدام:**
- Emergency contact information for drivers
- Special dietary requirements for passengers
- Custom maintenance fields for buses
- Additional trip attributes (weather conditions, traffic level)
- Industry-specific compliance fields

**Example:**
```sql
-- Tenant defines a custom field
INSERT INTO driver_custom_fields (tenant_id, name, label, field_type_id, required)
VALUES ('tenant-uuid', 'emergency_contact', 'Emergency Contact', 1, true);

-- Store value for a specific driver
INSERT INTO driver_custom_field_values (driver_id, custom_field_id, value)
VALUES ('driver-uuid', 1, '+20-123-456-7890');
```

---

### Indexing Strategy | استراتيجية الفهرسة

**Recommended Indexes | الفهارس الموصى بها:**

```sql
-- Multi-tenant queries
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_trips_tenant ON trips(tenant_id);
CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);

-- Foreign key lookups
CREATE INDEX idx_trips_route ON trips(route_id);
CREATE INDEX idx_trips_bus ON trips(bus_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);

-- Status filtering
CREATE INDEX idx_trips_status ON trips(status_id);
CREATE INDEX idx_bookings_status ON bookings(status_id);

-- Date-based queries
CREATE INDEX idx_trips_departure ON trips(departure_time);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_payments_created ON payments(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_trips_tenant_status ON trips(tenant_id, status_id);
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);

-- GPS data (time-series)
CREATE INDEX idx_gps_bus_time ON gps_data(bus_id, timestamp);
CREATE INDEX idx_trip_logs_trip_time ON trip_logs(trip_id, timestamp);
```

---

### Data Types & Conventions | أنواع البيانات والاتفاقيات

**UUID vs INT:**
- **UUID**: Used for main business entities (tenants, users, trips, bookings)
  - Better for distributed systems
  - Prevents ID enumeration attacks
  - Safe for public-facing APIs
  
- **INT**: Used for enum tables and high-volume time-series data
  - More efficient for joins
  - Smaller storage footprint
  - Better for internal references

**Timestamps:**
- `created_at`: Record creation time (immutable)
- `updated_at`: Last modification time
- Use TIMESTAMP for automatic timezone handling
- Store in UTC, convert at application layer

**Decimal Precision:**
- Money: `DECIMAL(10,2)` - supports up to 99,999,999.99
- Coordinates: `DECIMAL(10,6)` - ~11cm precision
- Ratings: `DECIMAL(2,1)` - supports 0.0 to 9.9
- Percentages: `DECIMAL(5,2)` - supports 0.00 to 999.99

---

## Query Patterns | أنماط الاستعلامات

### Common Queries | الاستعلامات الشائعة

**1. Get all active trips for a tenant:**
```sql
SELECT t.*, r.name as route_name, b.bus_number, d.license_number
FROM trips t
JOIN routes r ON t.route_id = r.id
JOIN buses b ON t.bus_id = b.id
JOIN drivers d ON t.driver_id = d.id
JOIN trip_statuses ts ON t.status_id = ts.id
WHERE t.tenant_id = ? AND ts.name = 'active';
```

**2. Get user with custom fields:**
```sql
SELECT u.*, 
       ucf.label as field_label,
       ucfv.value as field_value
FROM users u
LEFT JOIN user_custom_field_values ucfv ON u.id = ucfv.user_id
LEFT JOIN user_custom_fields ucf ON ucfv.custom_field_id = ucf.id
WHERE u.id = ? AND u.tenant_id = ?;
```

**3. Real-time bus tracking:**
```sql
SELECT b.bus_number, gd.latitude, gd.longitude, gd.speed, gd.timestamp
FROM gps_data gd
JOIN buses b ON gd.bus_id = b.id
WHERE b.tenant_id = ? 
  AND gd.timestamp > NOW() - INTERVAL 5 MINUTE
ORDER BY gd.timestamp DESC;
```

**4. Revenue report with aggregation:**
```sql
SELECT DATE(p.created_at) as date,
       SUM(p.amount) as total_revenue,
       COUNT(*) as transaction_count,
       pt.label as payment_type
FROM payments p
JOIN payment_types pt ON p.method_id = pt.id
JOIN payment_statuses ps ON p.status_id = ps.id
WHERE p.tenant_id = ?
  AND ps.name = 'success'
  AND p.created_at BETWEEN ? AND ?
GROUP BY DATE(p.created_at), pt.id;
```

**5. Trip performance analysis:**
```sql
SELECT t.id,
       r.name as route_name,
       tp.delays_count,
       tp.avg_occupancy,
       tp.rating,
       COUNT(b.id) as booking_count
FROM trips t
JOIN routes r ON t.route_id = r.id
LEFT JOIN trip_performance tp ON t.id = tp.trip_id
LEFT JOIN bookings b ON t.id = b.trip_id
WHERE t.tenant_id = ?
  AND t.departure_time BETWEEN ? AND ?
GROUP BY t.id;
```

---

## Security Considerations | اعتبارات الأمان

### Row-Level Security | الأمان على مستوى الصف

Always enforce tenant isolation in application queries:

```javascript
// ❌ WRONG - Missing tenant check
const trips = await db.query('SELECT * FROM trips WHERE id = ?', [tripId]);

// ✅ CORRECT - Include tenant_id
const trips = await db.query(
  'SELECT * FROM trips WHERE id = ? AND tenant_id = ?',
  [tripId, tenantId]
);
```

### Password Security | أمان كلمات المرور

- Store only hashed passwords using bcrypt/argon2
- Never store plain text passwords
- Implement password complexity requirements
- Use password reset tokens with expiration

### Payment Security | أمان الدفع

- Store only tokenized card data
- Never store full card numbers or CVV
- Use PCI-compliant payment gateways
- Log all payment transactions in `audit_logs`

### API Security | أمان API

- Implement rate limiting on authentication endpoints
- Use JWT tokens with short expiration times
- Log all sensitive operations in `logs` and `audit_logs` tables
- Implement IP-based access controls for admin operations

---

## Performance Optimization | تحسين الأداء

### Partitioning Strategy | استراتيجية التقسيم

For high-volume tables, consider partitioning:

```sql
-- Partition GPS data by month
CREATE TABLE gps_data (
  ...
) PARTITION BY RANGE (YEAR(timestamp)*100 + MONTH(timestamp)) (
  PARTITION p202401 VALUES LESS THAN (202402),
  PARTITION p202402 VALUES LESS THAN (202403),
  ...
);

-- Partition logs by tenant
CREATE TABLE logs (
  ...
) PARTITION BY HASH(tenant_id) PARTITIONS 16;
```

### Caching Strategy | استراتيجية التخزين المؤقت

**Cache frequently accessed data:**
- Enum table values (statuses, types)
- Tenant settings and configuration
- Active route information
- User permissions and roles

**Use Redis/Memcached for:**
- Session data
- Real-time GPS coordinates
- Active trip information
- Recent notifications

### Query Optimization | تحسين الاستعلامات

1. **Use EXPLAIN ANALYZE** to identify slow queries
2. **Add covering indexes** for frequently joined columns
3. **Denormalize** when necessary (e.g., `available_seats` in trips)
4. **Archive old data** to separate tables (older than 1 year)
5. **Use materialized views** for complex analytics queries

---

## Backup & Maintenance | النسخ الاحتياطي والصيانة

### Backup Strategy | استراتيجية النسخ الاحتياطي

1. **Full backups**: Daily at off-peak hours
2. **Incremental backups**: Every 6 hours
3. **Transaction log backups**: Every 15 minutes
4. **Retention**: 30 days for full, 7 days for incremental
5. **Test restores**: Weekly validation

### Data Archival | أرشفة البيانات

Archive old records to maintain performance:

```sql
-- Archive completed trips older than 1 year
INSERT INTO trips_archive 
SELECT * FROM trips 
WHERE status_id = (SELECT id FROM trip_statuses WHERE name = 'completed')
  AND departure_time < NOW() - INTERVAL 1 YEAR;

-- Delete archived records
DELETE FROM trips 
WHERE status_id = (SELECT id FROM trip_statuses WHERE name = 'completed')
  AND departure_time < NOW() - INTERVAL 1 YEAR;
```

### Maintenance Tasks | مهام الصيانة

```sql
-- Optimize tables weekly
OPTIMIZE TABLE trips, bookings, payments, gps_data;

-- Update statistics
ANALYZE TABLE trips, bookings, payments;

-- Clean up old logs (older than 90 days)
DELETE FROM logs WHERE timestamp < NOW() - INTERVAL 90 DAY;
DELETE FROM gps_data WHERE timestamp < NOW() - INTERVAL 90 DAY;
```

---

## Migration Guide | دليل الترحيل

### Initial Setup | الإعداد الأولي

1. Create enum tables first (no dependencies)
2. Create tenant and user tables
3. Create main business entity tables
4. Create junction and relationship tables
5. Create custom field tables
6. Create indexes and constraints

### Sample Migration Order | ترتيب الترحيل النموذجي

```
1. Enum tables (38-56)
2. field_types (57)
3. tenants (1)
4. tenant_settings (2)
5. users (3)
6. roles & permissions (4-7)
7. logs (8)
8. drivers, buses, routes, stations (9-12)
9. trips, trip_stations, trip_logs (13-15)
10. passengers, bookings, subscriptions, tickets, loyalty_points (16-20)
11. payments, payment_methods, revenues, expenses, financial_reports (21-25)
12. notifications, support_tickets, support_replies, emergency_alerts (26-29)
13. analytics_kpis, trip_performance (30-31)
14. gps_data, bus_status_logs, map_layers (32-34)
15. audit_logs, settings, attachments (35-37)
16. Custom field definition tables (58, 60, 62, 64, 66, 68, 70)
17. Custom field value tables (59, 61, 63, 65, 67, 69, 71)
```

---

## API Integration Examples | أمثلة تكامل API

### Create Booking with Custom Fields

```javascript
// 1. Create booking
const booking = await db.query(`
  INSERT INTO bookings (id, tenant_id, trip_id, user_id, seat_number, status_id, booking_date)
  VALUES (?, ?, ?, ?, ?, 
    (SELECT id FROM booking_statuses WHERE name = 'confirmed'),
    NOW()
  )
`, [bookingId, tenantId, tripId, userId, seatNumber]);

// 2. Add custom field values
const customFields = [
  { field_id: 1, value: 'Window preference' },
  { field_id: 2, value: 'Extra luggage' }
];

for (const field of customFields) {
  await db.query(`
    INSERT INTO booking_custom_field_values (booking_id, custom_field_id, value)
    VALUES (?, ?, ?)
  `, [bookingId, field.field_id, field.value]);
}
```

### Real-time Trip Tracking

```javascript
// Subscribe to GPS updates
const tripTracking = await db.query(`
  SELECT 
    t.id as trip_id,
    b.bus_number,
    r.name as route_name,
    gd.latitude,
    gd.longitude,
    gd.speed,
    gd.timestamp,
    ts.name as trip_status
  FROM trips t
  JOIN buses b ON t.bus_id = b.id
  JOIN routes r ON t.route_id = r.id
  JOIN trip_statuses ts ON t.status_id = ts.id
  LEFT JOIN LATERAL (
    SELECT latitude, longitude, speed, timestamp
    FROM gps_data
    WHERE bus_id = b.id
    ORDER BY timestamp DESC
    LIMIT 1
  ) gd ON true
  WHERE t.tenant_id = ? AND ts.name = 'active'
`, [tenantId]);
```

---

## Conclusion | الخاتمة

This database schema provides a robust foundation for a multi-tenant transportation management SaaS platform. Key features include:

يوفر مخطط قاعدة البيانات هذا أساسًا قويًا لمنصة SaaS لإدارة النقل متعددة العملاء. الميزات الرئيسية تشمل:

- ✅ Complete data isolation per tenant
- ✅ Flexible custom fields system
- ✅ Normalized enum tables for better maintainability
- ✅ Real-time tracking capabilities
- ✅ Comprehensive audit trails
- ✅ Financial reporting and analytics
- ✅ Scalable architecture
- ✅ Support for multiple languages (English/Arabic)

**Total Tables: 71**
- Main business tables: 37
- Enum tables: 19
- Custom field tables: 14
- Helper/utility tables: 1

---

## License | الترخيص

This schema documentation is provided as-is for educational and implementation purposes.

---

## Support | الدعم

For questions or contributions, please refer to the project repository or contact the development team.

لأي أسئلة أو مساهمات، يرجى الرجوع إلى مستودع المشروع أو الاتصال بفريق التطوير.

## System Management | إدارة النظام والـ SaaS

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
