const pool = require('./config/db');

async function checkConnection() {
  try {
    console.log('🔍 Checking database connection...\n');
    
    // Get connection info
    const client = await pool.connect();
    
    const dbInfo = await client.query('SELECT current_database(), current_user, version()');
    console.log('📊 Connection Info:');
    console.log('   Database:', dbInfo.rows[0].current_database);
    console.log('   User:', dbInfo.rows[0].current_user);
    console.log('   Version:', dbInfo.rows[0].version.split('\n')[0]);
    
    // Check tables
    const tables = await client.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
    `);
    
    console.log('\n📋 Tables found:');
    if (tables.rows.length === 0) {
      console.log('   ❌ No tables found!');
    } else {
      tables.rows.forEach(row => {
        console.log(`   ✓ ${row.schemaname}.${row.tablename}`);
      });
    }
    
    // Check if tables exist in public schema
    const publicTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    console.log('\n📋 Public schema tables:');
    if (publicTables.rows.length === 0) {
      console.log('   ❌ No tables in public schema!');
      console.log('\n⚠️  Tables may have been created in a different schema or database.');
      console.log('   Let me re-create them...');
    } else {
      publicTables.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
    }
    
    // Check search_path
    const searchPath = await client.query('SHOW search_path');
    console.log('\n🔍 Search path:', searchPath.rows[0].search_path);
    
    client.release();
    process.exit(publicTables.rows.length === 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Connection check failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

checkConnection();
