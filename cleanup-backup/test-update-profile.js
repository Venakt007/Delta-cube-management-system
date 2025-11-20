const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpdateProfile() {
  console.log('🧪 Testing Profile Update\n');
  
  // First, login to get a token
  try {
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'recruiter@test.com',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Test manual entry (create new profile)
    console.log('2️⃣ Testing manual entry (create new)...');
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'testuser@example.com');
    formData.append('phone', '1234567890');
    formData.append('linkedin', 'https://linkedin.com/in/testuser');
    formData.append('technology', 'JavaScript');
    formData.append('primary_skill', 'React');
    formData.append('secondary_skill', 'Node.js');
    formData.append('location', 'New York');
    formData.append('experience_years', '5');
    formData.append('action', 'new');
    
    const createResponse = await axios.post(
      'http://localhost:5000/api/applications/manual-entry',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Create successful:', createResponse.data);
    const profileId = createResponse.data.id;
    
    // Test update
    console.log('\n3️⃣ Testing profile update...');
    const updateFormData = new FormData();
    updateFormData.append('name', 'Test User Updated');
    updateFormData.append('email', 'testuser@example.com');
    updateFormData.append('phone', '1234567890');
    updateFormData.append('linkedin', 'https://linkedin.com/in/testuser');
    updateFormData.append('technology', 'JavaScript');
    updateFormData.append('primary_skill', 'React');
    updateFormData.append('secondary_skill', 'Vue.js'); // Changed
    updateFormData.append('location', 'San Francisco'); // Changed
    updateFormData.append('experience_years', '6'); // Changed
    updateFormData.append('action', 'update');
    updateFormData.append('existing_id', profileId);
    
    const updateResponse = await axios.post(
      'http://localhost:5000/api/applications/manual-entry',
      updateFormData,
      {
        headers: {
          ...updateFormData.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Update successful:', updateResponse.data);
    
    // Verify the update
    console.log('\n4️⃣ Verifying update...');
    const verifyResponse = await axios.get(
      'http://localhost:5000/api/applications/my-resumes',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const updatedProfile = verifyResponse.data.find(p => p.id === profileId);
    console.log('✅ Updated profile:', {
      name: updatedProfile.name,
      location: updatedProfile.location,
      secondary_skill: updatedProfile.secondary_skill,
      experience_years: updatedProfile.experience_years
    });
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testUpdateProfile();
