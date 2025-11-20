-- Create admin user with password: admin123
-- Run this with: psql -U postgres -d recruitment_db -f create-admin-user.sql

-- First, let's make sure we're in the right database
\c recruitment_db

-- Delete existing admin if any (to avoid conflicts)
DELETE FROM users WHERE email = 'admin@recruitment.com';

-- Create admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (email, password, name, role) 
VALUES (
  'admin@recruitment.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'System Admin',
  'admin'
);

-- Verify the user was created
SELECT id, email, name, role, created_at FROM users WHERE email = 'admin@recruitment.com';

-- Show success message
\echo ''
\echo '✅ Admin user created successfully!'
\echo ''
\echo 'Login with:'
\echo '  Email: admin@recruitment.com'
\echo '  Password: admin123'
\echo ''
