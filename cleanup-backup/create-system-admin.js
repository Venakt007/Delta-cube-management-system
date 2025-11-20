const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function createSystemAdmin() {
  try {
    const email = 'systemadmin@example.com';
    const password = 'admin123'; // Change this!
    const name = 'System Administrator';

    // Check if user already exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      console.log('⚠️  User already exists. Updating to system_admin role...');
      await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['system_admin', email]);
      console.log('✅ User updated to system_admin role!');
    } else {
      // Create new system admin
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4)',
        [email, hashedPassword, 'system_admin', name]
      );
      console.log('✅ System admin created successfully!');
    }

    console.log('\n📧 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   URL: http://localhost:3000/login`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

createSystemAdmin();
