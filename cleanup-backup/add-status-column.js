const pool = require('./config/db');

async function addStatusColumn() {
  console.log('📝 Adding recruitment_status column to applications table...\n');
  
  try {
    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='applications' AND column_name='recruitment_status'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Column recruitment_status already exists!');
      return;
    }
    
    // Add the column with default value
    await pool.query(`
      ALTER TABLE applications 
      ADD COLUMN recruitment_status VARCHAR(50) DEFAULT 'Pending'
    `);
    
    console.log('✅ Successfully added recruitment_status column!');
    console.log('\nColumn details:');
    console.log('  Name: recruitment_status');
    console.log('  Type: VARCHAR(50)');
    console.log('  Default: Pending');
    console.log('  Purpose: Track recruitment status of each application');
    console.log('\nAvailable statuses:');
    console.log('  - Pending');
    console.log('  - On Hold');
    console.log('  - Profile Not Found');
    console.log('  - Rejected');
    console.log('  - Submitted');
    console.log('  - Interview scheduled');
    console.log('  - Closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addStatusColumn();
