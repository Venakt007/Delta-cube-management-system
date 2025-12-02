const pool = require('./config/db');

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database setup...\n');
    
    // Check tables
    const tables = await pool.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables:');
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name} (${row.column_count} columns)`);
    });
    
    // Check users
    const users = await pool.query('SELECT id, email, name, role FROM users');
    console.log(`\n👥 Users (${users.rows.length}):`);
    users.rows.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Check technologies
    const techs = await pool.query('SELECT name FROM technologies ORDER BY name');
    console.log(`\n🔧 Technologies (${techs.rows.length}):`);
    techs.rows.forEach(tech => {
      console.log(`   - ${tech.name}`);
    });
    
    // Check applications
    const apps = await pool.query('SELECT COUNT(*) as count FROM applications');
    console.log(`\n📄 Applications: ${apps.rows[0].count}`);
    
    // Check indexes
    const indexes = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY indexname
    `);
    console.log(`\n📊 Indexes (${indexes.rows.length}):`);
    indexes.rows.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });
    
    console.log('\n✅ Database verification complete!');
    console.log('\n🚀 Your recruitment system is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Start the backend: npm run dev');
    console.log('2. Start the frontend: cd client && npm start');
    console.log('3. Login with: admin@recruitment.com / admin123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
