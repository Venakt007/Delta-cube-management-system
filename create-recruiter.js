const bcrypt = require('bcryptjs');
const pool = require('./config/db');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createRecruiter() {
  try {
    console.log('👤 Create Recruiter Account\n');
    console.log('═══════════════════════════════════════\n');
    
    const name = await question('Enter recruiter name: ');
    const email = await question('Enter recruiter email: ');
    const password = await question('Enter password (or press Enter for default "recruiter123"): ');
    
    const finalPassword = password.trim() || 'recruiter123';
    
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    
    console.log('💾 Creating recruiter account...');
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE 
       SET password = $2, name = $3, role = $4
       RETURNING id, email, name, role`,
      [email, hashedPassword, name, 'recruiter']
    );
    
    console.log('\n✅ Recruiter account created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${finalPassword}`);
    console.log(`Role:     recruiter`);
    console.log('═══════════════════════════════════════\n');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating recruiter:', error.message);
    rl.close();
    process.exit(1);
  }
}

createRecruiter();
