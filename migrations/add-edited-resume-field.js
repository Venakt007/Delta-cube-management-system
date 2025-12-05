const pool = require('../config/db');

async function addEditedResumeField() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Adding edited_resume_url field to applications table...\n');
    
    await client.query('BEGIN');
    
    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'applications' 
      AND column_name = 'edited_resume_url'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('⚠️  Column edited_resume_url already exists!');
      await client.query('ROLLBACK');
      process.exit(0);
    }
    
    // Add edited_resume_url column
    console.log('Adding edited_resume_url column...');
    await client.query(`
      ALTER TABLE applications 
      ADD COLUMN edited_resume_url VARCHAR(500)
    `);
    
    // Create index for better performance
    console.log('Creating index on edited_resume_url...');
    await client.query(`
      CREATE INDEX idx_applications_edited_resume 
      ON applications(edited_resume_url) 
      WHERE edited_resume_url IS NOT NULL
    `);
    
    await client.query('COMMIT');
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📝 Recruiters can now upload edited resumes');
    console.log('📝 Admins can download edited resumes when available\n');
    
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

addEditedResumeField();
