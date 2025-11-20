const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Running technologies table migration...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', 'create_technologies_table.sql'),
      'utf8'
    );
    
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('Technologies table created and default values inserted.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
