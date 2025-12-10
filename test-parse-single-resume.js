const { parseResume } = require('./utils/resumeParser');
const path = require('path');

async function testParsing() {
  console.log('🧪 Testing Resume Parser\n');
  console.log('='.repeat(60));
  
  // Get resume file from command line argument
  const resumePath = process.argv[2];
  
  if (!resumePath) {
    console.log('❌ Please provide a resume file path');
    console.log('\nUsage:');
    console.log('  node test-parse-single-resume.js path/to/resume.pdf');
    console.log('  node test-parse-single-resume.js uploads/resume.docx');
    console.log('\nExample:');
    console.log('  node test-parse-single-resume.js "uploads/Arbaj 3y 6m Nodejs+Reactjs.pdf"');
    process.exit(1);
  }
  
  console.log(`📄 Testing file: ${resumePath}\n`);
  
  try {
    const result = await parseResume(resumePath);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PARSING RESULTS:');
    console.log('='.repeat(60));
    
    if (result) {
      console.log('\n✅ Parsing successful!\n');
      console.log('Name:', result.name);
      console.log('Email:', result.email || '(not found)');
      console.log('Phone:', result.phone || '(not found)');
      console.log('Location:', result.location || '(not found)');
      console.log('Experience:', result.experience_years, 'years');
      console.log('Skills:', result.skills?.length > 0 ? result.skills.join(', ') : '(none found)');
      console.log('LinkedIn:', result.linkedin || '(not found)');
      console.log('Tier:', result.tier);
      console.log('Confidence:', result.confidence);
      
      if (result.education && result.education.length > 0) {
        console.log('\nEducation:');
        result.education.forEach((edu, i) => console.log(`  ${i + 1}. ${edu}`));
      }
      
      if (result.certifications && result.certifications.length > 0) {
        console.log('\nCertifications:');
        result.certifications.forEach((cert, i) => console.log(`  ${i + 1}. ${cert}`));
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('📋 FULL JSON:');
      console.log('='.repeat(60));
      console.log(JSON.stringify(result, null, 2));
      
    } else {
      console.log('\n❌ Parsing failed - returned null');
      console.log('\nPossible reasons:');
      console.log('  - File format not supported');
      console.log('  - File is corrupted');
      console.log('  - Text extraction failed');
      console.log('  - Resume content is too short');
    }
    
  } catch (error) {
    console.log('\n❌ ERROR during parsing:');
    console.log('Message:', error.message);
    console.log('\nStack trace:');
    console.log(error.stack);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Test complete!');
  console.log('='.repeat(60));
}

testParsing().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
