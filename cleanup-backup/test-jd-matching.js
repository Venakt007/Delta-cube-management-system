const axios = require('axios');

async function testJDMatching() {
  console.log('🧪 Testing JD Matching\n');
  
  try {
    // 1. Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@recruitment.com',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // 2. Check how many resumes exist
    console.log('2️⃣ Checking resumes in database...');
    const resumesResponse = await axios.get('http://localhost:5000/api/admin/resumes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${resumesResponse.data.length} resumes in database`);
    
    if (resumesResponse.data.length === 0) {
      console.log('\n⚠️  No resumes in database! Please upload some resumes first.');
      return;
    }
    
    // Show sample resume data
    console.log('\n📄 Sample resume data:');
    const sampleResume = resumesResponse.data[0];
    console.log({
      name: sampleResume.name,
      email: sampleResume.email,
      primary_skill: sampleResume.primary_skill,
      secondary_skill: sampleResume.secondary_skill,
      experience_years: sampleResume.experience_years,
      skills: sampleResume.parsed_data?.skills?.slice(0, 5)
    });
    
    // 3. Test JD matching
    console.log('\n3️⃣ Testing JD matching...');
    const jobDescription = `
We are looking for a Senior React Developer with 5+ years of experience.

Required Skills:
- React.js
- JavaScript
- Node.js
- TypeScript
- REST APIs

Preferred Skills:
- Redux
- GraphQL
- AWS
- Docker

Experience: 5-8 years
Location: Remote
    `;
    
    console.log('📝 Job Description:', jobDescription.substring(0, 100) + '...\n');
    
    const matchResponse = await axios.post(
      'http://localhost:5000/api/admin/jd-match',
      { jobDescription },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ JD Matching successful!\n');
    console.log('📊 JD Analysis:', matchResponse.data.jdAnalysis);
    console.log(`\n🎯 Found ${matchResponse.data.matches.length} matching candidates:\n`);
    
    // Show top 5 matches
    matchResponse.data.matches.slice(0, 5).forEach((match, idx) => {
      console.log(`${idx + 1}. ${match.name} - ${match.matchPercentage}%`);
      console.log(`   Email: ${match.email}`);
      console.log(`   Experience: ${match.experience_years} years`);
      console.log(`   Matching Skills: ${match.matchingSkills.join(', ') || 'None'}`);
      console.log(`   Missing Skills: ${match.missingSkills.join(', ') || 'None'}`);
      console.log('');
    });
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
      
      if (error.response.status === 400 && error.response.data.error === 'Failed to analyze job description') {
        console.error('\n⚠️  OpenAI API issue detected!');
        console.error('This could be:');
        console.error('1. Invalid API key');
        console.error('2. No access to GPT-4 model');
        console.error('3. API quota exceeded');
        console.error('\n💡 Solution: Switch to GPT-3.5-turbo (cheaper and more accessible)');
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

testJDMatching();
