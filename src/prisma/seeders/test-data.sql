-- ============================================
-- Quick Test Data for Driver Management
-- ============================================
-- Run this SQL in your PostgreSQL database
-- to create test users for driver creation
-- ============================================

-- Step 1: Create or use existing tenant
INSERT INTO tenants (id, name, plan_type, status, created_at, updated_at)
VALUES (
  '10000000-0000-4000-8000-000000000001',
  'Test Organization',
  'enterprise',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create test users for driver creation
INSERT INTO users (id, tenant_id, role, name, email, phone, password, status, must_change_password, created_at, updated_at)
VALUES 
  -- Test User 1
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'passenger',
    'John Test Driver',
    'john.driver@test.com',
    '+201234567890',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqaJYvYC6EM2',  -- password: Driver@123
    'active',
    false,
    NOW(),
    NOW()
  ),
  -- Test User 2
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'passenger',
    'Jane Test Driver',
    'jane.driver@test.com',
    '+201234567891',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqaJYvYC6EM2',  -- password: Driver@123
    'active',
    false,
    NOW(),
    NOW()
  ),
  -- Test User 3
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    'passenger',
    'Bob Test Driver',
    'bob.driver@test.com',
    '+201234567892',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqaJYvYC6EM2',  -- password: Driver@123
    'active',
    false,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Verify the data was created
SELECT 
  'Tenant' as type,
  id,
  name,
  status
FROM tenants
WHERE id = '10000000-0000-4000-8000-000000000001'

UNION ALL

SELECT 
  'User' as type,
  id,
  name,
  status
FROM users
WHERE id IN (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000003'
);

-- ============================================
-- READY TO USE IN GRAPHQL:
-- ============================================
-- Tenant ID: 10000000-0000-4000-8000-000000000001
--
-- User IDs:
-- - 20000000-0000-4000-8000-000000000001 (John Test Driver)
-- - 20000000-0000-4000-8000-000000000002 (Jane Test Driver)
-- - 20000000-0000-4000-8000-000000000003 (Bob Test Driver)
-- ============================================
