const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    console.log('Testing resume upload...\n');

    // First, login to get token
    console.log('1. Logging in as recruiter...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'recruiter@test.com',
      password: 'recruiter123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // Check if we have a test file
    console.log('2. Checking for test resume file...');
    
    // Create a simple test text file if no resume exists
    const testFile = 'test-resume.txt';
    if (!fs.existsSync(testFile)) {
      console.log('Creating test file...');
      fs.writeFileSync(testFile, `
John Doe
Email: john@example.com
Phone: +1234567890
Location: New York

EXPERIENCE
5 years of experience in software development

SKILLS
- JavaScript
- React
- Node.js
- Python
- SQL

EDUCATION
Bachelor of Science in Computer Science
      `);
      console.log('✅ Test file created\n');
    }

    // Try to upload
    console.log('3. Attempting to upload resume...');
    
    const form = new FormData();
    form.append('resumes', fs.createReadStream(testFile));

    try {
      const uploadResponse = await axios.post(
        'http://localhost:5000/api/applications/upload-bulk',
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('✅ Upload successful!');
      console.log('Response:', uploadResponse.data);
    } catch (uploadError) {
      console.error('❌ Upload failed!');
      console.error('Status:', uploadError.response?.status);
      console.error('Error:', uploadError.response?.data);
      console.error('Full error:', uploadError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Check if backend is running first
async function checkBackend() {
  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend is running\n');
    return true;
  } catch (error) {
    console.error('❌ Backend is NOT running!');
    console.error('Please start backend with: npm run dev\n');
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('Resume Upload Test');
  console.log('═══════════════════════════════════════\n');

  const backendRunning = await checkBackend();
  if (!backendRunning) {
    process.exit(1);
  }

  await testUpload();
}

main();
