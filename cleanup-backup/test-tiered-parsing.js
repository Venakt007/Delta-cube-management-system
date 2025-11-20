const fs = require('fs');
const path = require('path');
const { parseResume } = require('./utils/resumeParser');

async function testTieredParsing() {
  console.log('🧪 Testing Tiered Parsing System\n');
  console.log('='.repeat(60));
  
  const uploadsDir = path.join(__dirname, 'uploads');
  const files = fs.readdirSync(uploadsDir);
  
  const resumeFiles = files.filter(file => 
    file.endsWith('.pdf') || file.endsWith('.docx') || file.endsWith('.doc')
  );
  
  if (resumeFiles.length === 0) {
    console.log('❌ No resume files found in uploads folder');
    return;
  }
  
  console.log(`📁 Found ${resumeFiles.length} resume(s) to test\n`);
  
  let tier1Count = 0;
  let tier2Count = 0;
  let tier3Count = 0;
  let failedCount = 0;
  
  for (let i = 0; i < resumeFiles.length; i++) {
    const file = resumeFiles[i];
    const filePath = path.join(uploadsDir, file);
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 Testing Resume ${i + 1}/${resumeFiles.length}: ${file}`);
    console.log('='.repeat(60));
    
    const startTime = Date.now();
    
    try {
      const result = await parseResume(filePath);
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`\n⏱️  Parse Time: ${duration}s`);
      console.log(`🎯 Tier Used: ${result.tier || 'Unknown'}`);
      console.log(`📊 Confidence: ${result.confidence || 'N/A'}`);
      
      // Count which tier was used
      if (result.tier === 'tier1') tier1Count++;
      else if (result.tier === 'tier2') tier2Count++;
      else if (result.tier === 'tier3') tier3Count++;
      
      console.log('\n📋 Parsed Data:');
      console.log(`   Name: ${result.name || 'Not found'}`);
      console.log(`   Email: ${result.email || 'Not found'}`);
      console.log(`   Phone: ${result.phone || 'Not found'}`);
      console.log(`   Skills: ${result.skills?.length || 0} found`);
      console.log(`   Experience: ${result.experience?.length || 0} entries`);
      console.log(`   Education: ${result.education?.length || 0} entries`);
      
      if (result.skills?.length > 0) {
        console.log(`   Sample Skills: ${result.skills.slice(0, 5).join(', ')}`);
      }
      
      console.log('\n✅ Parse successful!');
      
    } catch (error) {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`\n⏱️  Parse Time: ${duration}s`);
      console.log(`\n❌ Parse failed: ${error.message}`);
      failedCount++;
    }
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 PARSING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Resumes Tested: ${resumeFiles.length}`);
  console.log(`✅ Successful: ${resumeFiles.length - failedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log('\n🎯 Tier Distribution:');
  console.log(`   Tier 1 (Structured): ${tier1Count} (${((tier1Count/resumeFiles.length)*100).toFixed(1)}%)`);
  console.log(`   Tier 2 (Regex): ${tier2Count} (${((tier2Count/resumeFiles.length)*100).toFixed(1)}%)`);
  console.log(`   Tier 3 (AI): ${tier3Count} (${((tier3Count/resumeFiles.length)*100).toFixed(1)}%)`);
  
  const aiCost = tier3Count * 0.002;
  const oldCost = resumeFiles.length * 0.002;
  const savings = ((1 - aiCost/oldCost) * 100).toFixed(1);
  
  console.log('\n💰 Cost Analysis:');
  console.log(`   Old System (all AI): $${oldCost.toFixed(4)}`);
  console.log(`   New System: $${aiCost.toFixed(4)}`);
  console.log(`   Savings: ${savings}% ($${(oldCost - aiCost).toFixed(4)})`);
  console.log('='.repeat(60));
}

// Run the test
testTieredParsing()
  .then(() => {
    console.log('\n✅ Test complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test error:', error);
    process.exit(1);
  });
