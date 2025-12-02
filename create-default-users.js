const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function createDefaultUsers() {
  try {
    console.log('👥 Creating default users...\n');
    
    // Admin user
    console.log('1️⃣  Creating Admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await pool.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE 
       SET password = $2, name = $3, role = $4
       RETURNING id, email, name, role`,
      ['admin@recruitment.com', adminPassword, 'System Admin', 'admin']
    );
    console.log('   ✅ Admin created:', admin.rows[0].email);
    
    // Recruiter user 1
    console.log('\n2️⃣  Creating Recruiter 1...');
    const recruiter1Password = await bcrypt.hash('recruiter123', 10);
    const recruiter1 = await pool.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE 
       SET password = $2, name = $3, role = $4
       RETURNING id, email, name, role`,
      ['recruiter@recruitment.com', recruiter1Password, 'John Recruiter', 'recruiter']
    );
    console.log('   ✅ Recruiter created:', recruiter1.rows[0].email);
    
    // Recruiter user 2
    console.log('\n3️⃣  Creating Recruiter 2...');
    const recruiter2Password = await bcrypt.hash('recruiter123', 10);
    const recruiter2 = await pool.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE 
       SET password = $2, name = $3, role = $4
       RETURNING id, email, name, role`,
      ['sarah@recruitment.com', recruiter2Password, 'Sarah Smith', 'recruiter']
    );
    console.log('   ✅ Recruiter created:', recruiter2.rows[0].email);
    
    // Show all users
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ All Users Created Successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const allUsers = await pool.query(
      'SELECT id, email, name, role FROM users ORDER BY role, id'
    );
    
    console.log('📋 LOGIN CREDENTIALS:\n');
    
    console.log('👑 ADMIN:');
    console.log('   Email:    admin@recruitment.com');
    console.log('   Password: admin123');
    console.log('   Role:     admin (full access)\n');
    
    console.log('👤 RECRUITER 1:');
    console.log('   Email:    recruiter@recruitment.com');
    console.log('   Password: recruiter123');
    console.log('   Role:     recruiter (own resumes only)\n');
    
    console.log('👤 RECRUITER 2:');
    console.log('   Email:    sarah@recruitment.com');
    console.log('   Password: recruiter123');
    console.log('   Role:     recruiter (own resumes only)\n');
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total users: ${allUsers.rows.length}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    process.exit(1);
  }
}

createDefaultUsers();
