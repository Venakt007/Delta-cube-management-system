-- ============================================
-- SIMPLE ADMIN USER SETUP
-- ============================================
-- Copy and paste this entire script into pgAdmin Query Tool
-- or run with: psql -U postgres -d recruitment_db -f SIMPLE_ADMIN_SETUP.sql
-- ============================================

-- Make sure we're connected to the right database
\c recruitment_db

-- Delete any existing admin user (to avoid conflicts)
DELETE FROM users WHERE email = 'admin@recruitment.com';

-- Create admin user
-- Email: admin@recruitment.com
-- Password: 123456
INSERT INTO users (email, password, name, role) 
VALUES (
  'admin@recruitment.com',
  '$2a$10$TK/Gn4sJWfYOsvJmDT6OC.fy4eRzXpSVSTMw10pUzd7yNZuM5DcOO',
  'System Admin',
  'admin'
);

-- Verify the user was created
SELECT 
  id, 
  email, 
  name, 
  role, 
  created_at 
FROM users 
WHERE email = 'admin@recruitment.com';

-- ============================================
-- SUCCESS! You can now login with:
-- Email: admin@recruitment.com
-- Password: 123456
-- ============================================
