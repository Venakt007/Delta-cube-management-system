// Migration script to add technology column to Render database
require('dotenv').config();
const pool = require('../config/db');

async function runMigration() {
  try {
    console.log('🔄 Starting migration: Add technology column...');
    console.log('📊 Database:', process.env.DATABASE_URL ? 'Connected' : 'Not configured');
    
    // Check if column exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'applications' 
      AND column_name = 'technology'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Column "technology" already exists. No migration needed.');
      return;
    }
    
    console.log('⚠️  Column "technology" not found. Adding it now...');
    
    // Add the column
    await pool.query(`
      ALTER TABLE applications 
      ADD COLUMN technology VARCHAR(255)
    `);
    
    console.log('✅ Column "technology" added successfully!');
    
    // Verify
    const verifyResult = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'applications' AND column_name = 'technology'
    `);
    
    console.log('📋 Verification:', verifyResult.rows[0]);
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
