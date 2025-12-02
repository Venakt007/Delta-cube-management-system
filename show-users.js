const pool = require('./config/db');

async function showUsers() {
  try {
    console.log('👥 Checking users in database...\n');
    
    const users = await pool.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY id'
    );
    
    if (users.rows.length === 0) {
      console.log('❌ No users found in database!\n');
    } else {
      console.log('✅ Users found:\n');
      console.log('═══════════════════════════════════════════════════════════');
      users.rows.forEach(user => {
        console.log(`ID:    ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Name:  ${user.name}`);
        console.log(`Role:  ${user.role}`);
        console.log(`Created: ${user.created_at}`);
        console.log('───────────────────────────────────────────────────────────');
      });
      console.log('\n📝 Login Credentials:');
      console.log('═══════════════════════════════════════════════════════════');
      users.rows.forEach(user => {
        console.log(`${user.role.toUpperCase()}:`);
        console.log(`  Email:    ${user.email}`);
        console.log(`  Password: admin123 (default)`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showUsers();
