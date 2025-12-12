// Test resume parsing on Render
require('dotenv').config();
const { pool } = require('./config/database');
const { parseResume } = require('./utils/resumeParser');

async function testParsing() {
  try {
    console.log('\n🔍 Testing Resume Parsing on Render...\n');
    
    // 1. Check environment
    console.log('1️⃣ Environment Check:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Set ✅' : 'Not set ❌'}`);
    console.log(`   Database: ${process.env.DATABASE_URL ? 'Connected ✅' : 'Not configured ❌'}`);
    
    // 2. Get a recent resume
    console.log('\n2️⃣ Fetching Recent Resume:');
    const result = await pool.query(`
      SELECT id, name, email, phone, resume_url, parsed_data, created_at
      FROM applications
      WHERE resume_url IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      console.log('   ❌ No resumes found in database');
      return;
    }
    
    const resume = result.rows[0];
    console.log(`   Resume ID: ${resume.id}`);
    console.log(`   Name: ${resume.name}`);
    console.log(`   Email: ${resume.email || 'Not found'}`);
    console.log(`   Phone: ${resume.phone || 'Not found'}`);
    console.log(`   Resume URL: ${resume.resume_url}`);
    console.log(`   Has parsed_data: ${resume.parsed_data ? 'Yes ✅' : 'No ❌'}`);
    
    // 3. Test parsing
    console.log('\n3️⃣ Testing Parser:');
    console.log(`   Parsing: ${resume.resume_url}`);
    
    try {
      const parsed = await parseResume(resume.resume_url);
      
      if (parsed) {
        console.log('\n   ✅ Parsing Successful!');
        console.log(`   Name: ${parsed.name}`);
        console.log(`   Email: ${parsed.email || 'Not found'}`);
        console.log(`   Phone: ${parsed.phone || 'Not found'}`);
        console.log(`   Skills: ${parsed.skills?.length || 0} found`);
        console.log(`   Experience: ${parsed.experience_years || 0} years`);
        console.log(`   Tier: ${parsed.tier}`);
        console.log(`   Confidence: ${parsed.confidence}`);
        
        // Check if name is filename
        if (parsed.name.includes('resume_') || parsed.name.includes('.pdf')) {
          console.log('\n   ⚠️  WARNING: Name looks like filename!');
          console.log('   This means parsing failed to extract actual name');
        }
      } else {
        console.log('   ❌ Parsing returned null');
      }
    } catch (parseError) {
      console.log(`   ❌ Parsing failed: ${parseError.message}`);
      console.log(`   Stack: ${parseError.stack}`);
    }
    
    // 4. Check if it's a Cloudinary URL
    console.log('\n4️⃣ URL Analysis:');
    if (resume.resume_url.includes('cloudinary')) {
      console.log('   Type: Cloudinary URL ☁️');
      console.log('   Parser should download and parse');
    } else if (resume.resume_url.startsWith('http')) {
      console.log('   Type: External URL 🌐');
    } else {
      console.log('   Type: Local file 📁');
    }
    
    // 5. Recommendations
    console.log('\n5️⃣ Recommendations:');
    if (!resume.email || !resume.phone) {
      console.log('   ⚠️  Missing contact info - parsing may have failed');
      console.log('   → Check if PDF is readable');
      console.log('   → Check if Cloudinary URL is accessible');
      console.log('   → Check backend logs during upload');
    }
    
    if (resume.name.includes('resume_')) {
      console.log('   ⚠️  Name is filename - parsing definitely failed');
      console.log('   → Re-upload the resume to test new parser');
      console.log('   → Check if PDF has extractable text (not scanned image)');
    }
    
    console.log('\n✅ Test Complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testParsing();
