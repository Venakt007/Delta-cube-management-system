const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Setting up database tables...\n');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Drop existing tables
    console.log('🗑️  Dropping existing tables (if any)...');
    await client.query('DROP TABLE IF EXISTS applications CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query('DROP TABLE IF EXISTS technologies CASCADE');
    console.log('✅ Old tables dropped\n');
    
    // 1. Create users table
    console.log('👥 Creating users table...');
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'recruiter')),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created\n');
    
    // 2. Create applications table
    console.log('📄 Creating applications table...');
    await client.query(`
      CREATE TABLE applications (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        linkedin VARCHAR(500),
        location VARCHAR(255),
        experience_years DECIMAL(4,1) DEFAULT 0,
        technology VARCHAR(255),
        primary_skill VARCHAR(500),
        secondary_skill VARCHAR(500),
        job_types VARCHAR(500),
        resume_url VARCHAR(500),
        id_proof_url VARCHAR(500),
        recruitment_status VARCHAR(50) DEFAULT 'Pending' CHECK (recruitment_status IN (
          'Pending', 'On Hold', 'Profile Not Found', 'Rejected', 
          'Submitted', 'Interview scheduled', 'Closed'
        )),
        placement_status VARCHAR(50) CHECK (placement_status IN ('Bench', 'Onboarded') OR placement_status IS NULL),
        source VARCHAR(50) NOT NULL CHECK (source IN ('html_form', 'dashboard')),
        referral_source VARCHAR(255) DEFAULT 'Direct',
        uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        parsed_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Applications table created\n');
    
    // 3. Create technologies table
    console.log('🔧 Creating technologies table...');
    await client.query(`
      CREATE TABLE technologies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Technologies table created\n');
    
    // 4. Create indexes
    console.log('📊 Creating indexes...');
    await client.query('CREATE INDEX idx_users_email ON users(email)');
    await client.query('CREATE INDEX idx_users_role ON users(role)');
    await client.query('CREATE INDEX idx_applications_uploaded_by ON applications(uploaded_by)');
    await client.query('CREATE INDEX idx_applications_source ON applications(source)');
    await client.query('CREATE INDEX idx_applications_experience ON applications(experience_years)');
    await client.query('CREATE INDEX idx_applications_recruitment_status ON applications(recruitment_status)');
    await client.query('CREATE INDEX idx_applications_placement_status ON applications(placement_status)');
    await client.query('CREATE INDEX idx_applications_created_at ON applications(created_at DESC)');
    await client.query('CREATE INDEX idx_applications_email ON applications(email)');
    await client.query('CREATE INDEX idx_applications_phone ON applications(phone)');
    await client.query('CREATE INDEX idx_applications_parsed_data ON applications USING GIN (parsed_data)');
    console.log('✅ Indexes created\n');
    
    // 5. Insert default technologies
    console.log('💾 Inserting default technologies...');
    await client.query(`
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
    `);
    console.log('✅ Default technologies inserted\n');
    
    // 6. Create trigger for updated_at
    console.log('⚡ Creating triggers...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    await client.query(`
      CREATE TRIGGER update_applications_updated_at 
        BEFORE UPDATE ON applications 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ Triggers created\n');
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables created:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    // Show counts
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const appCount = await client.query('SELECT COUNT(*) FROM applications');
    const techCount = await client.query('SELECT COUNT(*) FROM technologies');
    
    console.log('\n📊 Record counts:');
    console.log(`   - users: ${userCount.rows[0].count}`);
    console.log(`   - applications: ${appCount.rows[0].count}`);
    console.log(`   - technologies: ${techCount.rows[0].count}`);
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\n⚠️  NEXT STEP: Create your admin user by running:');
    console.log('   node scripts/createAdmin.js\n');
    
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database setup failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

setupDatabase();
