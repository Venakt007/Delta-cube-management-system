const pool = require('./config/db');

async function addJobTypesColumn() {
  console.log('📝 Adding job_types column to applications table...\n');
  
  try {
    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='applications' AND column_name='job_types'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Column job_types already exists!');
      return;
    }
    
    // Add the column
    await pool.query(`
      ALTER TABLE applications 
      ADD COLUMN job_types VARCHAR(200)
    `);
    
    console.log('✅ Successfully added job_types column!');
    console.log('\nColumn details:');
    console.log('  Name: job_types');
    console.log('  Type: VARCHAR(200)');
    console.log('  Purpose: Store comma-separated job type preferences');
    console.log('  Values: Full time, Part time, Consultant, Corporate trainer');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addJobTypesColumn();
