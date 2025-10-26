-- Create 4 admin users: Alpha, Bravo, Charlie, Delta
-- Password for all: Admin@2025!
-- Hashed with bcrypt (10 rounds): $2b$10$YPZQKz5gV4HhqE.x8C3x5.KqGv8YN0kj9VJqH3KP7Zr0FqGv8YN0k

-- Alpha Admin
INSERT INTO "User" (id, email, name, "emailVerified", role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'alpha@mvppir.com',
  'Alpha Admin',
  true,
  'ADMIN',
  'ACTIVE',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Bravo Admin
INSERT INTO "User" (id, email, name, "emailVerified", role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'bravo@mvppir.com',
  'Bravo Admin',
  true,
  'ADMIN',
  'ACTIVE',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Charlie Admin
INSERT INTO "User" (id, email, name, "emailVerified", role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'charlie@mvppir.com',
  'Charlie Admin',
  true,
  'ADMIN',
  'ACTIVE',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Delta Admin
INSERT INTO "User" (id, email, name, "emailVerified", role, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'delta@mvppir.com',
  'Delta Admin',
  true,
  'ADMIN',
  'ACTIVE',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create Account entries for Better Auth (password: Admin@2025!)
-- Alpha
INSERT INTO "Account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  'credential',
  u.id,
  '$2b$10$YPZQKz5gV4HhqE.x8C3x5.KqGv8YN0kj9VJqH3KP7Zr0FqGv8YN0k',
  NOW(),
  NOW()
FROM "User" u
WHERE u.email = 'alpha@mvppir.com'
ON CONFLICT DO NOTHING;

-- Bravo
INSERT INTO "Account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  'credential',
  u.id,
  '$2b$10$YPZQKz5gV4HhqE.x8C3x5.KqGv8YN0kj9VJqH3KP7Zr0FqGv8YN0k',
  NOW(),
  NOW()
FROM "User" u
WHERE u.email = 'bravo@mvppir.com'
ON CONFLICT DO NOTHING;

-- Charlie
INSERT INTO "Account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  'credential',
  u.id,
  '$2b$10$YPZQKz5gV4HhqE.x8C3x5.KqGv8YN0kj9VJqH3KP7Zr0FqGv8YN0k',
  NOW(),
  NOW()
FROM "User" u
WHERE u.email = 'charlie@mvppir.com'
ON CONFLICT DO NOTHING;

-- Delta
INSERT INTO "Account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  'credential',
  u.id,
  '$2b$10$YPZQKz5gV4HhqE.x8C3x5.KqGv8YN0kj9VJqH3KP7Zr0FqGv8YN0k',
  NOW(),
  NOW()
FROM "User" u
WHERE u.email = 'delta@mvppir.com'
ON CONFLICT DO NOTHING;

-- Display created admins
SELECT email, name, role, status FROM "User" WHERE role = 'ADMIN' ORDER BY "createdAt" DESC;
