-- ============================================
-- Complete Database Setup for Recruitment System
-- Run this file: psql -U your_username -d recruitment_db -f setup-complete-database.sql
-- ============================================

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;

-- ============================================
-- 1. CREATE USERS TABLE
-- ============================================
-- Stores admin and recruiter accounts
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'recruiter')),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'User accounts for admin and recruiters';
COMMENT ON COLUMN users.role IS 'User role: admin (full access) or recruiter (own resumes only)';

-- ============================================
-- 2. CREATE APPLICATIONS TABLE (Resume Storage)
-- ============================================
-- Main table storing all candidate resumes and information
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    linkedin VARCHAR(500),
    location VARCHAR(255),
    experience_years DECIMAL(4,1) DEFAULT 0,
    
    -- Skills & Technology
    technology VARCHAR(255),
    primary_skill VARCHAR(500),
    secondary_skill VARCHAR(500),
    
    -- Job Preferences
    job_types VARCHAR(500),
    
    -- File URLs
    resume_url VARCHAR(500),
    id_proof_url VARCHAR(500),
    
    -- Status Tracking
    recruitment_status VARCHAR(50) DEFAULT 'Pending' CHECK (recruitment_status IN (
        'Pending', 
        'On Hold', 
        'Profile Not Found', 
        'Rejected', 
        'Submitted', 
        'Interview scheduled', 
        'Closed'
    )),
    placement_status VARCHAR(50) CHECK (placement_status IN ('Bench', 'Onboarded') OR placement_status IS NULL),
    
    -- Source Tracking
    source VARCHAR(50) NOT NULL CHECK (source IN ('html_form', 'dashboard')),
    referral_source VARCHAR(255) DEFAULT 'Direct',
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- AI Parsed Data (JSON)
    parsed_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE applications IS 'Candidate resumes and application data';
COMMENT ON COLUMN applications.source IS 'html_form: public form submission, dashboard: recruiter upload';
COMMENT ON COLUMN applications.recruitment_status IS 'Current recruitment pipeline status';
COMMENT ON COLUMN applications.placement_status IS 'Bench: Available, Onboarded: Placed with client';
COMMENT ON COLUMN applications.parsed_data IS 'AI-extracted resume data in JSON format';
COMMENT ON COLUMN applications.referral_source IS 'How candidate found us (Direct, LinkedIn, Referral, etc.)';

-- ============================================
-- 3. CREATE TECHNOLOGIES TABLE
-- ============================================
-- Technology categories for filtering
CREATE TABLE technologies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE technologies IS 'Technology categories for candidate filtering';

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Application indexes
CREATE INDEX idx_applications_uploaded_by ON applications(uploaded_by);
CREATE INDEX idx_applications_source ON applications(source);
CREATE INDEX idx_applications_experience ON applications(experience_years);
CREATE INDEX idx_applications_recruitment_status ON applications(recruitment_status);
CREATE INDEX idx_applications_placement_status ON applications(placement_status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_applications_email ON applications(email);
CREATE INDEX idx_applications_phone ON applications(phone);

-- JSONB index for parsed_data (enables fast skill searches)
CREATE INDEX idx_applications_parsed_data ON applications USING GIN (parsed_data);

-- Text search indexes for skills
CREATE INDEX idx_applications_primary_skill ON applications USING GIN (to_tsvector('english', primary_skill));
CREATE INDEX idx_applications_secondary_skill ON applications USING GIN (to_tsvector('english', secondary_skill));

-- ============================================
-- 5. INSERT DEFAULT DATA
-- ============================================

-- Insert default technologies
INSERT INTO technologies (name) VALUES 
    ('Web Development'),
    ('Mobile Development'),
    ('Data Science'),
    ('DevOps'),
    ('Cloud Computing'),
    ('AI/ML'),
    ('Backend Development'),
    ('Frontend Development'),
    ('Full Stack Development'),
    ('Database Administration'),
    ('QA/Testing'),
    ('UI/UX Design'),
    ('Cybersecurity'),
    ('Blockchain'),
    ('Game Development')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 6. CREATE TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. SHOW CREATED TABLES AND SUMMARY
-- ============================================

\echo ''
\echo '✅ Database setup completed successfully!'
\echo ''
\echo '📋 Created Tables:'
\echo ''

SELECT 
    table_name,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name AND table_schema = 'public') as columns
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''
\echo '📊 Table Details:'
\echo ''

-- Users table info
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'applications', COUNT(*) FROM applications
UNION ALL
SELECT 'technologies', COUNT(*) FROM technologies;

\echo ''
\echo '⚠️  IMPORTANT: Create your admin user by running:'
\echo '   node scripts/createAdmin.js'
\echo ''
