// Script to clean skills in parsed_data JSON field
require('dotenv').config();
const pool = require('../config/db');

async function cleanParsedDataSkills() {
  try {
    console.log('\n🧹 Starting parsed_data skill cleanup...\n');
    
    // Get all resumes with parsed_data
    const resumes = await pool.query(`
      SELECT id, parsed_data 
      FROM applications 
      WHERE parsed_data IS NOT NULL
    `);
    
    console.log(`📊 Found ${resumes.rows.length} resumes with parsed_data\n`);
    
    let updatedCount = 0;
    const junkWords = ['and', 'or', 'with', 'in', 'the', 'a', 'an', '&'];
    
    for (const resume of resumes.rows) {
      const parsedData = resume.parsed_data;
      
      if (parsedData && parsedData.skills && Array.isArray(parsedData.skills)) {
        const originalSkills = parsedData.skills;
        
        // Clean skills array
        const cleanedSkills = originalSkills
          .map(s => {
            let cleaned = s.trim();
            // Remove "and ", "or ", "with " from the beginning
            cleaned = cleaned.replace(/^(and|or|with|in|the|a|an)\s+/gi, '');
            return cleaned.trim();
          })
          .filter(s => {
            const lower = s.toLowerCase();
            return s.length > 1 && !junkWords.includes(lower);
          });
        
        // Check if anything changed
        if (JSON.stringify(originalSkills) !== JSON.stringify(cleanedSkills)) {
          parsedData.skills = cleanedSkills;
          
          console.log(`📝 Resume ${resume.id}:`);
          console.log(`   Before: [${originalSkills.join(', ')}]`);
          console.log(`   After:  [${cleanedSkills.join(', ')}]`);
          
          // Update database
          await pool.query(
            `UPDATE applications 
             SET parsed_data = $1
             WHERE id = $2`,
            [JSON.stringify(parsedData), resume.id]
          );
          
          updatedCount++;
          console.log(`   ✅ Updated\n`);
        }
      }
    }
    
    console.log('\n=== Cleanup Summary ===');
    console.log(`Total resumes checked: ${resumes.rows.length}`);
    console.log(`Resumes updated: ${updatedCount}`);
    console.log(`Resumes unchanged: ${resumes.rows.length - updatedCount}`);
    console.log('======================\n');
    
    console.log('✅ Parsed data cleanup completed!\n');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanParsedDataSkills();
