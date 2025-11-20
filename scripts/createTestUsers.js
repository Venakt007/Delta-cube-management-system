const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function createTestUsers() {
  try {
    console.log('Creating test users...\n');

    // Create test recruiter
    const recruiterPassword = await bcrypt.hash('recruiter123', 10);
    const recruiter = await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      ['recruiter@test.com', recruiterPassword, 'Test Recruiter', 'recruiter']
    );
    console.log('✅ Recruiter created:');
    console.log('   Email: recruiter@test.com');
    console.log('   Password: recruiter123');
    console.log('   Role: recruiter\n');

    // Create another test recruiter
    const recruiter2Password = await bcrypt.hash('recruiter456', 10);
    const recruiter2 = await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      ['recruiter2@test.com', recruiter2Password, 'Jane Recruiter', 'recruiter']
    );
    console.log('✅ Second Recruiter created:');
    console.log('   Email: recruiter2@test.com');
    console.log('   Password: recruiter456');
    console.log('   Role: recruiter\n');

    // Create test admin (if not exists)
    const adminPassword = await bcrypt.hash('admin456', 10);
    try {
      const admin = await pool.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
        ['admin2@test.com', adminPassword, 'Test Admin', 'admin']
      );
      console.log('✅ Additional Admin created:');
      console.log('   Email: admin2@test.com');
      console.log('   Password: admin456');
      console.log('   Role: admin\n');
    } catch (err) {
      if (err.code === '23505') {
        console.log('ℹ️  Admin already exists\n');
      }
    }

    console.log('═══════════════════════════════════════');
    console.log('Test users created successfully!');
    console.log('═══════════════════════════════════════\n');
    console.log('Default Admin (from database.sql):');
    console.log('  Email: admin@recruitment.com');
    console.log('  Password: admin123\n');
    console.log('You can now login with any of these accounts.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error.message);
    process.exit(1);
  }
}

createTestUsers();
