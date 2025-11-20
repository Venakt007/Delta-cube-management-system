const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Running field size migration...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', 'increase_field_sizes.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('Field sizes increased to handle longer data.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
