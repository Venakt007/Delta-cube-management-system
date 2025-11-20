-- Setup script for recruitment database
-- Run this file to create tables and default admin user

-- Connect to the database first:
-- psql -U postgres -d recruitment_db -f setup-database.sql

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'recruiter')),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    linkedin VARCHAR(500),
    technology VARCHAR(100),
    primary_skill VARCHAR(100),
    secondary_skill VARCHAR(100),
    location VARCHAR(100),
    experience_years DECIMAL(4,1),
    resume_url VARCHAR(500),
    id_proof_url VARCHAR(500),
    source VARCHAR(50) NOT NULL CHECK (source IN ('html_form', 'dashboard')),
    uploaded_by INTEGER REFERENCES users(id),
    parsed_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_uploaded_by ON applications(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_applications_source ON applications(source);
CREATE INDEX IF NOT EXISTS idx_applications_skills ON applications USING GIN (parsed_data);
CREATE INDEX IF NOT EXISTS idx_applications_experience ON applications(experience_years);

-- Insert default admin user (password: admin123)
-- Password hash generated with bcrypt for 'admin123'
INSERT INTO users (email, password, role, name) 
VALUES ('admin@recruitment.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Admin')
ON CONFLICT (email) DO NOTHING;

-- Verify admin user was created
SELECT id, email, name, role, created_at FROM users WHERE email = 'admin@recruitment.com';
