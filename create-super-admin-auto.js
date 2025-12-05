const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
  try {
    console.log('\n🔐 Creating Super Admin User...\n');

    // Super admin credentials
    const name = 'Super Admin';
    const email = 'superadmin@example.com';
    const password = 'SuperAdmin123!';

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('⚠️  Super admin user already exists!');
      console.log('\nExisting User Details:');
      console.log(`  Email: ${existingUser.rows[0].email}`);
      console.log(`  Name: ${existingUser.rows[0].name}`);
      console.log(`  Role: ${existingUser.rows[0].role}`);
      console.log('\n💡 Use these credentials to login:');
      console.log(`  Email: ${email}`);
      console.log(`  Password: (use your existing password)`);
      console.log('\n🔄 To reset password, run: node manage-users.js\n');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'super_admin']
    );

    console.log('✅ Super Admin created successfully!');
    console.log('\n📋 User Details:');
    console.log(`  ID: ${result.rows[0].id}`);
    console.log(`  Name: ${result.rows[0].name}`);
    console.log(`  Email: ${result.rows[0].email}`);
    console.log(`  Role: ${result.rows[0].role}`);
    console.log('\n🔑 Login Credentials:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    console.log('\n🚀 You can now login at: http://localhost:5000/login');
    console.log('   You will be redirected to: /super-admin\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating super admin:', error.message);
    process.exit(1);
  }
}

createSuperAdmin();
