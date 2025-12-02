const bcrypt = require('bcryptjs');
const pool = require('./config/db');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetPassword() {
  try {
    console.log('🔐 Password Reset Tool\n');
    console.log('═══════════════════════════════════════\n');
    
    // Show existing users
    const users = await pool.query(
      'SELECT id, email, name, role FROM users ORDER BY id'
    );
    
    console.log('📋 Existing Users:\n');
    users.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.name}`);
    });
    console.log('');
    
    const email = await question('Enter email address to reset password: ');
    
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      [email]
    );
    
    if (userCheck.rows.length === 0) {
      console.log('\n❌ User not found!');
      rl.close();
      process.exit(1);
    }
    
    const user = userCheck.rows[0];
    console.log(`\n✅ Found user: ${user.name} (${user.role})`);
    
    const newPassword = await question('\nEnter new password: ');
    
    if (!newPassword || newPassword.trim().length < 6) {
      console.log('\n❌ Password must be at least 6 characters!');
      rl.close();
      process.exit(1);
    }
    
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('💾 Updating password...');
    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );
    
    console.log('\n✅ Password reset successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('New Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${newPassword}`);
    console.log(`Role:     ${user.role}`);
    console.log('═══════════════════════════════════════\n');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error resetting password:', error.message);
    rl.close();
    process.exit(1);
  }
}

resetPassword();
