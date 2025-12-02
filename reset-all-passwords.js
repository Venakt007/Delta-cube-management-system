const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function resetAllPasswords() {
  try {
    console.log('🔐 Resetting all passwords to "admin123"...\n');
    
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const users = await pool.query('SELECT id, email, name, role FROM users');
    
    for (const user of users.rows) {
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
      console.log(`✅ ${user.email} - Password reset to "admin123"`);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ All passwords have been reset!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📋 LOGIN CREDENTIALS:\n');
    users.rows.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.name}`);
      console.log(`  Email:    ${user.email}`);
      console.log(`  Password: admin123`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAllPasswords();
