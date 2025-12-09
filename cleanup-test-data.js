const pool = require('./config/db');

async function cleanupTestData() {
  try {
    console.log('🧹 Cleaning up test data...\n');
    
    // Option 1: Delete resumes from last hour (likely test data)
    console.log('Option 1: Delete resumes uploaded in last hour');
    const recentCount = await pool.query(
      `SELECT COUNT(*) FROM applications 
       WHERE created_at > NOW() - INTERVAL '1 hour' 
       AND source = 'dashboard'`
    );
    console.log(`   Found ${recentCount.rows[0].count} recent uploads\n`);
    
    // Option 2: Delete resumes with parsing errors
    console.log('Option 2: Delete resumes with parsing errors');
    const errorCount = await pool.query(
      `SELECT COUNT(*) FROM applications 
       WHERE (name = 'Unknown' OR email = '' OR email IS NULL)
       AND source = 'dashboard'`
    );
    console.log(`   Found ${errorCount.rows[0].count} resumes with parsing errors\n`);
    
    // Option 3: Delete ALL dashboard resumes
    console.log('Option 3: Delete ALL dashboard resumes');
    const allCount = await pool.query(
      `SELECT COUNT(*) FROM applications WHERE source = 'dashboard'`
    );
    console.log(`   Found ${allCount.rows[0].count} total dashboard resumes\n`);
    
    // Ask user which option to use
    console.log('─────────────────────────────────────────────');
    console.log('Which cleanup option do you want?');
    console.log('1 = Recent uploads (last hour)');
    console.log('2 = Parsing errors only');
    console.log('3 = ALL dashboard resumes');
    console.log('0 = Cancel (no deletion)');
    console.log('─────────────────────────────────────────────\n');
    
    // For automated cleanup, default to option 1 (recent uploads)
    const option = process.argv[2] || '1';
    
    let deleteQuery = '';
    let description = '';
    
    switch(option) {
      case '1':
        deleteQuery = `DELETE FROM applications 
                       WHERE created_at > NOW() - INTERVAL '1 hour' 
                       AND source = 'dashboard' 
                       RETURNING id, name`;
        description = 'recent uploads (last hour)';
        break;
      case '2':
        deleteQuery = `DELETE FROM applications 
                       WHERE (name = 'Unknown' OR email = '' OR email IS NULL)
                       AND source = 'dashboard'
                       RETURNING id, name`;
        description = 'resumes with parsing errors';
        break;
      case '3':
        deleteQuery = `DELETE FROM applications 
                       WHERE source = 'dashboard' 
                       RETURNING id, name`;
        description = 'ALL dashboard resumes';
        break;
      case '0':
        console.log('❌ Cleanup cancelled\n');
        process.exit(0);
      default:
        console.log('❌ Invalid option\n');
        process.exit(1);
    }
    
    console.log(`🗑️  Deleting ${description}...\n`);
    
    const result = await pool.query(deleteQuery);
    
    console.log(`✅ Deleted ${result.rows.length} resume(s):\n`);
    result.rows.forEach((row, idx) => {
      console.log(`   ${idx + 1}. ${row.name} (ID: ${row.id})`);
    });
    
    console.log('\n✅ Cleanup complete!\n');
    
    // Verify remaining count
    const remaining = await pool.query(
      `SELECT COUNT(*) FROM applications WHERE source = 'dashboard'`
    );
    console.log(`📊 Remaining dashboard resumes: ${remaining.rows[0].count}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run cleanup
cleanupTestData();
