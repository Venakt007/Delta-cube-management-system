const pool = require('../config/db');

async function addAssignedToField() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting migration: Add assigned_to field...\n');
    
    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'assigned_to'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Column assigned_to already exists. Skipping migration.');
      return;
    }
    
    // Add assigned_to column
    console.log('Adding assigned_to column...');
    await client.query(`
      ALTER TABLE applications 
      ADD COLUMN assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL
    `);
    
    // Add assigned_at column to track when assignment was made
    console.log('Adding assigned_at column...');
    await client.query(`
      ALTER TABLE applications 
      ADD COLUMN assigned_at TIMESTAMP
    `);
    
    // Add index for better query performance
    console.log('Creating index on assigned_to...');
    await client.query(`
      CREATE INDEX idx_applications_assigned_to ON applications(assigned_to)
    `);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('📝 Recruiters can now assign resumes to admins');
    console.log('📝 Admins can see resumes assigned to them\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
addAssignedToField()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
