const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function checkPasswords() {
  try {
    console.log('🔍 Checking password hashes...\n');
    
    const users = await pool.query('SELECT id, email, password, name, role FROM users ORDER BY id');
    
    console.log('📋 Users and their password hashes:\n');
    users.rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password Hash: ${user.password.substring(0, 20)}...`);
      console.log(`Hash Length: ${user.password.length}`);
      console.log(`Looks like bcrypt: ${user.password.startsWith('$2b$') ? '✅ YES' : '❌ NO'}`);
      console.log('─────────────────────────────────────────');
    });
    
    // Test password verification
    console.log('\n🧪 Testing password "admin123" against each user:\n');
    
    for (const user of users.rows) {
      const isMatch = await bcrypt.compare('admin123', user.password);
      console.log(`${user.email}: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPasswords();
