const pool = require('./config/db');

async function cleanStart() {
  try {
    console.log('🧹 Starting clean database reset...\n');
    
    // Count current applications
    const countBefore = await pool.query('SELECT COUNT(*) FROM applications');
    console.log(`Current applications: ${countBefore.rows[0].count}\n`);
    
    console.log('⚠️  Deleting ALL applications...');
    
    // Delete all applications
    const result = await pool.query('DELETE FROM applications RETURNING id');
    console.log(`✅ Deleted ${result.rows.length} applications\n`);
    
    // Verify
    const countAfter = await pool.query('SELECT COUNT(*) FROM applications');
    console.log(`Remaining applications: ${countAfter.rows[0].count}\n`);
    
    if (countAfter.rows[0].count === '0') {
      console.log('✅ Clean start complete!');
      console.log('✅ Database is now empty and ready for fresh uploads.\n');
      console.log('🎯 Next steps:');
      console.log('1. Push code to GitHub: git add . && git commit -m "Clean start" && git push');
      console.log('2. Wait for Render to deploy (2-3 minutes)');
      console.log('3. Upload fresh resumes with Cloudinary\n');
    } else {
      console.log('⚠️  Warning: Database still has records!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanStart();
