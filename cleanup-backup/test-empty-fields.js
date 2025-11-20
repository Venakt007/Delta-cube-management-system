const axios = require('axios');
const FormData = require('form-data');

async function testEmptyFields() {
  console.log('🧪 Testing Profile Update with Empty Fields\n');
  
  try {
    // Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'recruiter@test.com',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Test 1: Create profile with empty experience
    console.log('2️⃣ Testing create with empty experience field...');
    const formData1 = new FormData();
    formData1.append('name', 'Test Empty Fields');
    formData1.append('email', 'testempty@example.com');
    formData1.append('phone', '9999999999');
    formData1.append('linkedin', '');
    formData1.append('technology', '');
    formData1.append('primary_skill', 'React');
    formData1.append('secondary_skill', '');
    formData1.append('location', '');
    formData1.append('experience_years', ''); // Empty string
    formData1.append('action', 'new');
    
    const createResponse = await axios.post(
      'http://localhost:5000/api/applications/manual-entry',
      formData1,
      {
        headers: {
          ...formData1.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Create successful:', createResponse.data);
    const profileId = createResponse.data.id;
    
    // Test 2: Update profile with empty fields
    console.log('\n3️⃣ Testing update with empty fields...');
    const formData2 = new FormData();
    formData2.append('name', 'Test Empty Fields Updated');
    formData2.append('email', 'testempty@example.com');
    formData2.append('phone', '9999999999');
    formData2.append('linkedin', '');
    formData2.append('technology', 'JavaScript');
    formData2.append('primary_skill', 'React');
    formData2.append('secondary_skill', 'Node.js');
    formData2.append('location', 'Remote');
    formData2.append('experience_years', ''); // Still empty
    formData2.append('action', 'update');
    formData2.append('existing_id', profileId);
    
    const updateResponse = await axios.post(
      'http://localhost:5000/api/applications/manual-entry',
      formData2,
      {
        headers: {
          ...formData2.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Update successful:', updateResponse.data);
    
    // Test 3: Update with valid experience
    console.log('\n4️⃣ Testing update with valid experience...');
    const formData3 = new FormData();
    formData3.append('name', 'Test Empty Fields Final');
    formData3.append('email', 'testempty@example.com');
    formData3.append('phone', '9999999999');
    formData3.append('linkedin', 'https://linkedin.com/in/test');
    formData3.append('technology', 'JavaScript');
    formData3.append('primary_skill', 'React');
    formData3.append('secondary_skill', 'Node.js');
    formData3.append('location', 'Remote');
    formData3.append('experience_years', '5'); // Valid number
    formData3.append('action', 'update');
    formData3.append('existing_id', profileId);
    
    const updateResponse2 = await axios.post(
      'http://localhost:5000/api/applications/manual-entry',
      formData3,
      {
        headers: {
          ...formData3.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Update successful:', updateResponse2.data);
    
    // Verify
    console.log('\n5️⃣ Verifying final profile...');
    const verifyResponse = await axios.get(
      'http://localhost:5000/api/applications/my-resumes',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const finalProfile = verifyResponse.data.find(p => p.id === profileId);
    console.log('✅ Final profile:', {
      name: finalProfile.name,
      email: finalProfile.email,
      experience_years: finalProfile.experience_years,
      location: finalProfile.location,
      technology: finalProfile.technology
    });
    
    console.log('\n✅ All tests passed! Empty fields are handled correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testEmptyFields();
