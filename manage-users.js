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

async function listUsers() {
  const result = await pool.query('SELECT id, email, name, role FROM users ORDER BY id');
  console.log('\n📋 Current Users:');
  console.log('═══════════════════════════════════════════════════════════');
  result.rows.forEach(user => {
    console.log(`ID: ${user.id} | ${user.email} | ${user.name} | ${user.role}`);
  });
  console.log('═══════════════════════════════════════════════════════════\n');
}

async function addUser() {
  console.log('\n➕ Add New User\n');
  
  const email = await question('Email: ');
  const name = await question('Name: ');
  const password = await question('Password: ');
  const role = await question('Role (admin/recruiter): ');
  
  if (!['admin', 'recruiter'].includes(role)) {
    console.log('❌ Invalid role! Must be "admin" or "recruiter"');
    return;
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
      [email, hashedPassword, name, role]
    );
    console.log(`✅ User ${email} created successfully!`);
  } catch (error) {
    if (error.code === '23505') {
      console.log('❌ Email already exists!');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

async function deleteUser() {
  await listUsers();
  
  const email = await question('Enter email to delete: ');
  
  const confirm = await question(`⚠️  Delete ${email}? (yes/no): `);
  if (confirm.toLowerCase() !== 'yes') {
    console.log('Cancelled.');
    return;
  }
  
  const result = await pool.query('DELETE FROM users WHERE email = $1 RETURNING email', [email]);
  
  if (result.rows.length > 0) {
    console.log(`✅ User ${email} deleted successfully!`);
  } else {
    console.log('❌ User not found!');
  }
}

async function updatePassword() {
  await listUsers();
  
  const email = await question('Enter email to update password: ');
  const newPassword = await question('New password: ');
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const result = await pool.query(
    'UPDATE users SET password = $1 WHERE email = $2 RETURNING email',
    [hashedPassword, email]
  );
  
  if (result.rows.length > 0) {
    console.log(`✅ Password updated for ${email}!`);
  } else {
    console.log('❌ User not found!');
  }
}

async function main() {
  console.log('👥 User Management Tool\n');
  console.log('1. List all users');
  console.log('2. Add new user');
  console.log('3. Delete user');
  console.log('4. Update password');
  console.log('5. Exit\n');
  
  const choice = await question('Choose option (1-5): ');
  
  switch (choice) {
    case '1':
      await listUsers();
      break;
    case '2':
      await addUser();
      break;
    case '3':
      await deleteUser();
      break;
    case '4':
      await updatePassword();
      break;
    case '5':
      console.log('Goodbye!');
      rl.close();
      process.exit(0);
      return;
    default:
      console.log('Invalid option!');
  }
  
  rl.close();
  process.exit(0);
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
