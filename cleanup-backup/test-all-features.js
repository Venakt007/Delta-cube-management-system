const pool = require('./config/db');
const axios = require('axios');

async function testAllFeatures() {
  console.log('🧪 Testing All Features Before Production Cleanup\n');
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing Database Connection...');
    const dbTest = await pool.query('SELECT NOW()');
    console.log('   ✅ Database connected:', dbTest.rows[0].now);
    
    // Test 2: Check Tables Exist
    console.log('\n2️⃣ Testing Database Tables...');
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('   ✅ Tables found:', tables.rows.map(r => r.table_name).join(', '));
    
    // Test 3: Check Users Exist
    console.log('\n3️⃣ Testing Users...');
    const users = await pool.query('SELECT id, email, role FROM users ORDER BY role');
    console.log('   ✅ Users found:', users.rows.length);
    users.rows.forEach(u => {
      console.log(`      - ${u.email} (${u.role})`);
    });
    
    // Test 4: Check Applications Table Structure
    console.log('\n4️⃣ Testing Applications Table Structure...');
    const columns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'applications' 
      ORDER BY ordinal_position
    `);
    const requiredColumns = [
      'id', 'name', 'email', 'phone', 'recruitment_status', 
      'placement_status', 'referral_source', 'uploaded_by'
    ];
    const existingColumns = columns.rows.map(r => r.column_name);
    const missingColumns = requiredColumns.filter(c => !existingColumns.includes(c));
    
    if (missingColumns.length === 0) {
      console.log('   ✅ All required columns exist');
    } else {
      console.log('   ❌ Missing columns:', missingColumns.join(', '));
      allTestsPassed = false;
    }
    
    // Test 5: Check File Structure
    console.log('\n5️⃣ Testing File Structure...');
    const fs = require('fs');
    const requiredFiles = [
      'server.js',
      'package.json',
      '.env',
      'config/db.js',
      'routes/auth.js',
      'routes/applications.js',
      'routes/admin.js',
      'routes/system-admin.js',
      'middleware/auth.js',
      'middleware/upload.js',
      'utils/resumeParser.js',
      'client/src/App.js',
      'client/src/pages/ApplicationForm.js',
      'client/src/pages/Login.js',
      'client/src/pages/RecruiterDashboard.js',
      'client/src/pages/AdminDashboard.js',
      'client/src/pages/SystemAdminDashboard.js'
    ];
    
    let missingFiles = [];
    requiredFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
      }
    });
    
    if (missingFiles.length === 0) {
      console.log('   ✅ All required files exist');
    } else {
      console.log('   ❌ Missing files:', missingFiles.join(', '));
      allTestsPassed = false;
    }
    
    // Test 6: Check Environment Variables
    console.log('\n6️⃣ Testing Environment Variables...');
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
    const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missingEnvVars.length === 0) {
      console.log('   ✅ All required environment variables set');
    } else {
      console.log('   ⚠️  Missing environment variables:', missingEnvVars.join(', '));
      console.log('      (OPENAI_API_KEY is optional)');
    }
    
    // Test 7: Check Uploads Directory
    console.log('\n7️⃣ Testing Uploads Directory...');
    if (fs.existsSync('uploads')) {
      console.log('   ✅ Uploads directory exists');
    } else {
      console.log('   ⚠️  Uploads directory missing (will be created on first upload)');
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    if (allTestsPassed) {
      console.log('✅ ALL TESTS PASSED - Project is ready for production cleanup!');
    } else {
      console.log('❌ SOME TESTS FAILED - Fix issues before cleanup!');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    allTestsPassed = false;
  } finally {
    process.exit(allTestsPassed ? 0 : 1);
  }
}

testAllFeatures();
