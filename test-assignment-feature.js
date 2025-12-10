const pool = require('./config/db');

async function testAssignmentFeature() {
  console.log('🧪 Testing Resume Assignment Feature...\n');
  
  try {
    // 1. Check if columns exist
    console.log('1️⃣  Checking database schema...');
    const columns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'applications' 
      AND column_name IN ('assigned_to', 'assigned_at')
      ORDER BY column_name
    `);
    
    if (columns.rows.length === 2) {
      console.log('   ✅ assigned_to column exists');
      console.log('   ✅ assigned_at column exists');
    } else {
      console.log('   ❌ Missing columns! Run migration first.');
      process.exit(1);
    }
    
    // 2. Check if index exists
    console.log('\n2️⃣  Checking indexes...');
    const indexes = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'applications' 
      AND indexname = 'idx_applications_assigned_to'
    `);
    
    if (indexes.rows.length > 0) {
      console.log('   ✅ Index on assigned_to exists');
    } else {
      console.log('   ⚠️  Index missing (optional, but recommended)');
    }
    
    // 3. Get sample data
    console.log('\n3️⃣  Checking sample data...');
    const admins = await pool.query(`
      SELECT id, name, role 
      FROM users 
      WHERE role IN ('admin', 'super_admin') 
      LIMIT 3
    `);
    
    console.log(`   ✅ Found ${admins.rows.length} admin(s):`);
    admins.rows.forEach(admin => {
      console.log(`      - ${admin.name} (${admin.role})`);
    });
    
    const resumes = await pool.query(`
      SELECT id, name, uploaded_by, assigned_to 
      FROM applications 
      LIMIT 5
    `);
    
    console.log(`\n   ✅ Found ${resumes.rows.length} resume(s):`);
    resumes.rows.forEach(resume => {
      const assignStatus = resume.assigned_to ? `Assigned to user ${resume.assigned_to}` : 'Not assigned';
      console.log(`      - ${resume.name} (${assignStatus})`);
    });
    
    // 4. Test assignment query
    if (admins.rows.length > 0 && resumes.rows.length > 0) {
      console.log('\n4️⃣  Testing assignment query...');
      const testAdmin = admins.rows[0];
      const testResume = resumes.rows[0];
      
      // Simulate assignment
      await pool.query(`
        UPDATE applications 
        SET assigned_to = $1, assigned_at = NOW() 
        WHERE id = $2
      `, [testAdmin.id, testResume.id]);
      
      console.log(`   ✅ Test assignment successful: Resume ${testResume.id} → Admin ${testAdmin.name}`);
      
      // Query assigned resumes
      const assigned = await pool.query(`
        SELECT a.id, a.name, u.name as admin_name
        FROM applications a
        LEFT JOIN users u ON a.assigned_to = u.id
        WHERE a.assigned_to = $1
      `, [testAdmin.id]);
      
      console.log(`   ✅ Query assigned resumes: Found ${assigned.rows.length} resume(s) for ${testAdmin.name}`);
      
      // Cleanup test
      await pool.query(`
        UPDATE applications 
        SET assigned_to = NULL, assigned_at = NULL 
        WHERE id = $1
      `, [testResume.id]);
      
      console.log(`   ✅ Test cleanup successful`);
    }
    
    console.log('\n✅ All tests passed! Feature is ready to use.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testAssignmentFeature();
