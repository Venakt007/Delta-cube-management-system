const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:12345678@localhost:5432/recruitment_db'
});

async function createAdmin() {
  try {
    console.log('Creating admin user...\n');

    // Hash password '123456'
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    console.log('Password hash generated:', hashedPassword);

    // Delete existing admin if any
    await pool.query("DELETE FROM users WHERE email = 'admin@recruitment.com'");

    // Insert new admin
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role`,
      ['admin@recruitment.com', hashedPassword, 'System Admin', 'admin']
    );

    console.log('\n✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('Email:    admin@recruitment.com');
    console.log('Password: 123456');
    console.log('Role:     admin');
    console.log('═══════════════════════════════════════\n');

    console.log('User details:', result.rows[0]);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === '42P01') {
      console.error('\n⚠️  Tables do not exist! Run this first:');
      console.error('psql -U postgres -d recruitment_db -f database.sql\n');
    } else if (error.code === '3D000') {
      console.error('\n⚠️  Database does not exist! Run this first:');
      console.error('psql -U postgres -c "CREATE DATABASE recruitment_db;"\n');
    }
    
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
