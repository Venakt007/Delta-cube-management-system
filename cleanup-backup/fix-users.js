const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function fixUsers() {
  console.log('🔧 Fixing user passwords...\n');
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Update all users with the hashed password
    const users = [
      { email: 'admin@recruitment.com', name: 'System Admin', role: 'admin' },
      { email: 'recruiter@test.com', name: 'Test Recruiter', role: 'recruiter' },
      { email: 'recruiter2@test.com', name: 'Jane Recruiter', role: 'recruiter' },
      { email: 'admin2@test.com', name: 'Test Admin', role: 'admin' }
    ];
    
    for (const user of users) {
      // Check if user exists
      const checkResult = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
      
      if (checkResult.rows.length > 0) {
        // Update existing user
        await pool.query(
          'UPDATE users SET password = $1, name = $2, role = $3 WHERE email = $4',
          [hashedPassword, user.name, user.role, user.email]
        );
        console.log(`✅ Updated: ${user.email}`);
      } else {
        // Create new user
        await pool.query(
          'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
          [user.email, hashedPassword, user.name, user.role]
        );
        console.log(`✅ Created: ${user.email}`);
      }
    }
    
    console.log('\n✅ All users fixed!\n');
    console.log('═══════════════════════════════════════');
    console.log('🔑 Login Credentials (for all users):');
    console.log('═══════════════════════════════════════');
    console.log('Password: 123456\n');
    console.log('Available users:');
    users.forEach(user => {
      console.log(`  📧 ${user.email} (${user.role})`);
    });
    console.log('═══════════════════════════════════════\n');
    
    // Verify by listing all users
    const allUsers = await pool.query('SELECT id, email, name, role FROM users ORDER BY id');
    console.log('All users in database:');
    console.table(allUsers.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixUsers();
