const pool = require('./config/db');

async function testDatabaseOperations() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing database operations...\n');
    
    // ============================================
    // TEST 1: Add Technology
    // ============================================
    console.log('1️⃣  Testing ADD TECHNOLOGY...');
    const newTech = await client.query(
      `INSERT INTO technologies (name) VALUES ($1) RETURNING *`,
      ['React Native']
    );
    console.log('   ✅ Technology added:', newTech.rows[0].name);
    
    // Verify it exists
    const techCheck = await client.query(
      `SELECT * FROM technologies WHERE name = $1`,
      ['React Native']
    );
    console.log('   ✅ Verified in database:', techCheck.rows[0].name);
    
    // ============================================
    // TEST 2: Create Application (Resume)
    // ============================================
    console.log('\n2️⃣  Testing CREATE APPLICATION...');
    const newApp = await client.query(
      `INSERT INTO applications 
       (name, email, phone, linkedin, technology, primary_skill, secondary_skill, 
        location, experience_years, job_types, resume_url, source, uploaded_by, 
        recruitment_status, placement_status, referral_source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id, name, email, recruitment_status, placement_status`,
      [
        'John Doe',
        'john.doe@example.com',
        '+1234567890',
        'https://linkedin.com/in/johndoe',
        'Web Development',
        'React, Node.js',
        'MongoDB, Express',
        'New York, USA',
        5.5,
        'Full-time, Remote',
        '/uploads/resume-123.pdf',
        'dashboard',
        1, // uploaded_by admin user
        'Pending',
        null,
        'LinkedIn'
      ]
    );
    console.log('   ✅ Application created:', newApp.rows[0]);
    const appId = newApp.rows[0].id;
    
    // ============================================
    // TEST 3: Edit/Update Application
    // ============================================
    console.log('\n3️⃣  Testing EDIT/UPDATE APPLICATION...');
    const updatedApp = await client.query(
      `UPDATE applications 
       SET name = $1, 
           email = $2, 
           phone = $3,
           primary_skill = $4,
           experience_years = $5,
           location = $6,
           recruitment_status = $7
       WHERE id = $8
       RETURNING id, name, email, recruitment_status, updated_at`,
      [
        'John Doe Updated',
        'john.updated@example.com',
        '+9876543210',
        'React, Node.js, TypeScript',
        6.0,
        'San Francisco, USA',
        'Interview scheduled',
        appId
      ]
    );
    console.log('   ✅ Application updated:', updatedApp.rows[0]);
    console.log('   ✅ Updated timestamp:', updatedApp.rows[0].updated_at);
    
    // ============================================
    // TEST 4: Update Recruitment Status
    // ============================================
    console.log('\n4️⃣  Testing UPDATE RECRUITMENT STATUS...');
    const statusUpdate = await client.query(
      `UPDATE applications 
       SET recruitment_status = $1 
       WHERE id = $2 
       RETURNING id, name, recruitment_status`,
      ['Submitted', appId]
    );
    console.log('   ✅ Status updated:', statusUpdate.rows[0]);
    
    // ============================================
    // TEST 5: Update Placement Status
    // ============================================
    console.log('\n5️⃣  Testing UPDATE PLACEMENT STATUS...');
    const placementUpdate = await client.query(
      `UPDATE applications 
       SET placement_status = $1 
       WHERE id = $2 
       RETURNING id, name, placement_status`,
      ['Onboarded', appId]
    );
    console.log('   ✅ Placement status updated:', placementUpdate.rows[0]);
    
    // ============================================
    // TEST 6: Get All Technologies
    // ============================================
    console.log('\n6️⃣  Testing GET ALL TECHNOLOGIES...');
    const allTechs = await client.query(
      `SELECT name FROM technologies ORDER BY name ASC`
    );
    console.log(`   ✅ Found ${allTechs.rows.length} technologies:`);
    allTechs.rows.slice(0, 5).forEach(tech => {
      console.log(`      - ${tech.name}`);
    });
    console.log(`      ... and ${allTechs.rows.length - 5} more`);
    
    // ============================================
    // TEST 7: Get Application by ID
    // ============================================
    console.log('\n7️⃣  Testing GET APPLICATION BY ID...');
    const getApp = await client.query(
      `SELECT * FROM applications WHERE id = $1`,
      [appId]
    );
    console.log('   ✅ Application retrieved:', {
      id: getApp.rows[0].id,
      name: getApp.rows[0].name,
      email: getApp.rows[0].email,
      recruitment_status: getApp.rows[0].recruitment_status,
      placement_status: getApp.rows[0].placement_status
    });
    
    // ============================================
    // TEST 8: Filter Applications
    // ============================================
    console.log('\n8️⃣  Testing FILTER APPLICATIONS...');
    const filtered = await client.query(
      `SELECT id, name, email, recruitment_status 
       FROM applications 
       WHERE recruitment_status = $1`,
      ['Submitted']
    );
    console.log(`   ✅ Found ${filtered.rows.length} applications with status 'Submitted'`);
    
    // ============================================
    // TEST 9: Delete Application
    // ============================================
    console.log('\n9️⃣  Testing DELETE APPLICATION...');
    const deleteApp = await client.query(
      `DELETE FROM applications WHERE id = $1 RETURNING id, name`,
      [appId]
    );
    console.log('   ✅ Application deleted:', deleteApp.rows[0]);
    
    // ============================================
    // TEST 10: Delete Technology
    // ============================================
    console.log('\n🔟 Testing DELETE TECHNOLOGY...');
    const deleteTech = await client.query(
      `DELETE FROM technologies WHERE name = $1 RETURNING name`,
      ['React Native']
    );
    console.log('   ✅ Technology deleted:', deleteTech.rows[0].name);
    
    // ============================================
    // FINAL VERIFICATION
    // ============================================
    console.log('\n📊 Final Database State:');
    const finalUsers = await client.query('SELECT COUNT(*) FROM users');
    const finalApps = await client.query('SELECT COUNT(*) FROM applications');
    const finalTechs = await client.query('SELECT COUNT(*) FROM technologies');
    
    console.log(`   - Users: ${finalUsers.rows[0].count}`);
    console.log(`   - Applications: ${finalApps.rows[0].count}`);
    console.log(`   - Technologies: ${finalTechs.rows[0].count}`);
    
    console.log('\n✅ All database operations working correctly!');
    console.log('✅ Your application features (Edit, Update, Add Technology) are fully supported!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

testDatabaseOperations();
