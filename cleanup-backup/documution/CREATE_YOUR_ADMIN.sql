-- Create admin user for rekhamanideep@gmail.com
-- Password: 1234567
-- 
-- HOW TO RUN THIS:
-- Option 1: In pgAdmin, open this file and execute it
-- Option 2: In command line: psql -U postgres -d recruitment_db -f CREATE_YOUR_ADMIN.sql

-- Connect to the database
\c recruitment_db

-- Delete existing user if any (to avoid conflicts)
DELETE FROM users WHERE email = 'rekhamanideep@gmail.com';

-- Create your admin user
-- Email: rekhamanideep@gmail.com
-- Password: 1234567 (hashed with bcrypt)
INSERT INTO users (email, password, name, role) 
VALUES (
  'rekhamanideep@gmail.com',
  '$2a$10$TK/Gn4sJWfYOsvJmDT6OC.fy4eRzXpSVSTMw10pUzd7yNZuM5DcOO',
  'Rekha Manideep',
  'admin'
);

-- Verify the user was created
SELECT id, email, name, role, created_at FROM users WHERE email = 'rekhamanideep@gmail.com';

-- Show success message
\echo ''
\echo '✅ Admin user created successfully!'
\echo ''
\echo 'Login with:'
\echo '  Email: rekhamanideep@gmail.com'
\echo '  Password: 1234567'
\echo ''
\echo 'Go to: http://localhost:3000/login'
\echo ''
