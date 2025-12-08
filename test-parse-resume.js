const { parseResume } = require('./utils/resumeParser');

async function testParsing() {
  console.log('🧪 Testing Resume Parser\n');
  
  // Test with a sample resume URL or file path
  const testFile = process.argv[2];
  
  if (!testFile) {
    console.log('Usage: node test-parse-resume.js <file-path-or-url>');
    console.log('Example: node test-parse-resume.js ./uploads/resume.pdf');
    console.log('Example: node test-parse-resume.js https://res.cloudinary.com/.../resume.pdf');
    process.exit(1);
  }
  
  console.log(`📄 Testing file: ${testFile}\n`);
  
  try {
    const result = await parseResume(testFile);
    
    if (result) {
      console.log('\n✅ Parsing successful!\n');
      console.log('📊 Parsed Data:');
      console.log('─────────────────────────────────────');
      console.log(`Name:        ${result.name || 'Not found'}`);
      console.log(`Email:       ${result.email || 'Not found'}`);
      console.log(`Phone:       ${result.phone || 'Not found'}`);
      console.log(`Location:    ${result.location || 'Not found'}`);
      console.log(`Experience:  ${result.experience_years || 0} years`);
      console.log(`LinkedIn:    ${result.linkedin || 'Not found'}`);
      console.log(`Skills:      ${result.skills?.join(', ') || 'Not found'}`);
      console.log(`Tier:        ${result.tier || 'unknown'}`);
      console.log(`Confidence:  ${result.confidence || 'unknown'}`);
      console.log('─────────────────────────────────────\n');
    } else {
      console.log('\n❌ Parsing failed - returned null\n');
    }
  } catch (error) {
    console.error('\n❌ Error during parsing:', error.message);
    console.error('Stack:', error.stack);
  }
}

testParsing();
