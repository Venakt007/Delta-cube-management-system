const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function createAdminUser() {
  try {
    console.log('Creating default admin user...\n');

    // Hash the password 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Try to insert admin user
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE 
       SET password = $2, name = $3, role = $4
       RETURNING id, email, name, role`,
      ['admin@recruitment.com', hashedPassword, 'System Admin', 'admin']
    );

    console.log('✅ Admin user created/updated successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('Email:    admin@recruitment.com');
    console.log('Password: admin123');
    console.log('Role:     admin');
    console.log('═══════════════════════════════════════\n');
    console.log('⚠️  IMPORTANT: Change this password after first login!\n');

    // Verify by querying
    const verify = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE email = $1',
      ['admin@recruitment.com']
    );

    if (verify.rows.length > 0) {
      console.log('✅ Verification successful!');
      console.log('User details:', verify.rows[0]);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === '42P01') {
      console.error('\n⚠️  Tables do not exist!');
      console.error('Please run the database schema first:');
      console.error('psql -U postgres -d recruitment_db -f database.sql\n');
    } else if (error.code === '3D000') {
      console.error('\n⚠️  Database does not exist!');
      console.error('Please create the database first:');
      console.error('psql -U postgres -c "CREATE DATABASE recruitment_db;"\n');
    }
    
    process.exit(1);
  }
}

createAdminUser();
