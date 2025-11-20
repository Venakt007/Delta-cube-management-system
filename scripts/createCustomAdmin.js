const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Database connection - using your credentials
const pool = new Pool({
  connectionString: 'postgresql://postgres:12345678@localhost:5432/recruitment_db'
});

async function createCustomAdmin() {
  try {
    console.log('Creating custom admin user...\n');

    // Hash password '1234567'
    const hashedPassword = await bcrypt.hash('1234567', 10);
    
    console.log('Password hash generated successfully');

    // Delete existing user if any
    await pool.query("DELETE FROM users WHERE email = 'rekhamanideep@gmail.com'");

    // Insert new admin
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role`,
      ['rekhamanideep@gmail.com', hashedPassword, 'Rekha Manideep', 'admin']
    );

    console.log('\n✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('Email:    rekhamanideep@gmail.com');
    console.log('Password: 1234567');
    console.log('Role:     admin');
    console.log('═══════════════════════════════════════\n');

    console.log('User details:', result.rows[0]);
    console.log('\n✅ You can now login at http://localhost:3000/login\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === '42P01') {
      console.error('\n⚠️  Tables do not exist!');
      console.error('Please create tables first by running database.sql\n');
    } else if (error.code === '3D000') {
      console.error('\n⚠️  Database does not exist!');
      console.error('Please create database first\n');
    } else if (error.code === '28P01') {
      console.error('\n⚠️  PostgreSQL password is incorrect!');
      console.error('Current password in script: 12345678');
      console.error('Please update the password in this script if different\n');
    }
    
    await pool.end();
    process.exit(1);
  }
}

createCustomAdmin();
