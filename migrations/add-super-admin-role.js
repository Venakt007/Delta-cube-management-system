const pool = require('../config/db');

async function addSuperAdminRole() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding super_admin role to database...\n');
    
    await client.query('BEGIN');
    
    // Drop the existing constraint
    console.log('Dropping old role constraint...');
    await client.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_role_check
    `);
    
    // Add new constraint with super_admin
    console.log('Adding new role constraint with super_admin...');
    await client.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('super_admin', 'admin', 'recruiter'))
    `);
    
    await client.query('COMMIT');
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📝 You can now create super admin users using:');
    console.log('   node create-super-admin.js');
    console.log('   OR');
    console.log('   node manage-users.js\n');
    
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

addSuperAdminRole();
