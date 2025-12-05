const pool = require('./config/db');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createSuperAdmin() {
  try {
    console.log('\n🔐 Create Super Admin User\n');
    console.log('Super Admin has full access to:');
    console.log('  - All resumes (recruiter uploads & social media)');
    console.log('  - Onboarded candidates');
    console.log('  - JD search across all resumes');
    console.log('  - User management (add/edit/delete users)\n');

    const name = await question('Enter name: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password: ');

    if (!name || !email || !password) {
      console.log('\n❌ All fields are required');
      rl.close();
      process.exit(1);
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('\n❌ User with this email already exists');
      rl.close();
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'super_admin']
    );

    console.log('\n✅ Super Admin created successfully!');
    console.log('\nUser Details:');
    console.log(`  ID: ${result.rows[0].id}`);
    console.log(`  Name: ${result.rows[0].name}`);
    console.log(`  Email: ${result.rows[0].email}`);
    console.log(`  Role: ${result.rows[0].role}`);
    console.log('\n🚀 You can now login at /login with these credentials\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating super admin:', error.message);
    rl.close();
    process.exit(1);
  }
}

createSuperAdmin();
