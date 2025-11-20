const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkDatabase() {
  try {
    console.log('Checking database connection...\n');

    // Test connection
    const version = await pool.query('SELECT version()');
    console.log('✅ Database connected successfully!\n');

    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Users table does NOT exist!');
      console.log('Run this command first:');
      console.log('psql -U postgres -d recruitment_db -f database.sql\n');
      await pool.end();
      return;
    }

    console.log('✅ Users table exists\n');

    // Check for admin user
    const adminCheck = await pool.query(
      "SELECT id, email, name, role, created_at FROM users WHERE email = 'admin@recruitment.com'"
    );

    if (adminCheck.rows.length === 0) {
      console.log('❌ Admin user does NOT exist in database!\n');
      console.log('Creating admin user now...\n');

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('123456', 10);

      const result = await pool.query(
        `INSERT INTO users (email, password, name, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, email, name, role`,
        ['admin@recruitment.com', hashedPassword, 'System Admin', 'admin']
      );

      console.log('✅ Admin user created successfully!\n');
      console.log('User details:', result.rows[0]);
      console.log('\n═══════════════════════════════════════');
      console.log('Login Credentials:');
      console.log('═══════════════════════════════════════');
      console.log('Email:    admin@recruitment.com');
      console.log('Password: 123456');
      console.log('═══════════════════════════════════════\n');
    } else {
      console.log('✅ Admin user EXISTS in database!\n');
      console.log('User details:', adminCheck.rows[0]);
      console.log('\n═══════════════════════════════════════');
      console.log('Login Credentials:');
      console.log('═══════════════════════════════════════');
      console.log('Email:    admin@recruitment.com');
      console.log('Password: 123456');
      console.log('═══════════════════════════════════════\n');

      // Test password
      const bcrypt = require('bcryptjs');
      const user = await pool.query(
        "SELECT password FROM users WHERE email = 'admin@recruitment.com'"
      );
      
      const isMatch = await bcrypt.compare('123456', user.rows[0].password);
      
      if (isMatch) {
        console.log('✅ Password verification: SUCCESS');
        console.log('The password "123456" is correct!\n');
      } else {
        console.log('❌ Password verification: FAILED');
        console.log('The stored password does not match "123456"\n');
        console.log('Updating password to "123456"...\n');
        
        const newHash = await bcrypt.hash('123456', 10);
        await pool.query(
          "UPDATE users SET password = $1 WHERE email = 'admin@recruitment.com'",
          [newHash]
        );
        
        console.log('✅ Password updated successfully!\n');
      }
    }

    // Check all users
    const allUsers = await pool.query('SELECT id, email, name, role FROM users');
    console.log('All users in database:');
    console.table(allUsers.rows);

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === '3D000') {
      console.error('\n⚠️  Database "recruitment_db" does not exist!');
      console.error('Create it with: psql -U postgres -c "CREATE DATABASE recruitment_db;"\n');
    } else if (error.code === '28P01') {
      console.error('\n⚠️  PostgreSQL password is incorrect!');
      console.error('Check your .env file DATABASE_URL\n');
    }
    
    await pool.end();
  }
}

checkDatabase();
