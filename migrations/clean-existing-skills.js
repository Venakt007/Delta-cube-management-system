// Script to clean existing skills in database - remove 'and', 'or', commas, etc.
require('dotenv').config();
const pool = require('../config/db');

async function cleanSkills() {
  try {
    console.log('\n🧹 Starting skill cleanup...\n');
    
    // Get all resumes with skills
    const resumes = await pool.query(`
      SELECT id, primary_skill, secondary_skill 
      FROM applications 
      WHERE primary_skill IS NOT NULL OR secondary_skill IS NOT NULL
    `);
    
    console.log(`📊 Found ${resumes.rows.length} resumes with skills\n`);
    
    let updatedCount = 0;
    const junkWords = ['and', 'or', 'with', 'in', 'the', 'a', 'an', '&', ','];
    
    for (const resume of resumes.rows) {
      let primaryCleaned = null;
      let secondaryCleaned = null;
      let needsUpdate = false;
      
      // Clean primary_skill
      if (resume.primary_skill) {
        const skills = resume.primary_skill
          .split(',')
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
        
        primaryCleaned = skills.join(', ');
        
        if (primaryCleaned !== resume.primary_skill) {
          needsUpdate = true;
          console.log(`📝 Resume ${resume.id}:`);
          console.log(`   Before: ${resume.primary_skill}`);
          console.log(`   After:  ${primaryCleaned}`);
        }
      }
      
      // Clean secondary_skill
      if (resume.secondary_skill) {
        const skills = resume.secondary_skill
          .split(',')
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
        
        secondaryCleaned = skills.join(', ');
        
        if (secondaryCleaned !== resume.secondary_skill) {
          needsUpdate = true;
          if (!primaryCleaned || primaryCleaned === resume.primary_skill) {
            console.log(`📝 Resume ${resume.id}:`);
          }
          console.log(`   Secondary Before: ${resume.secondary_skill}`);
          console.log(`   Secondary After:  ${secondaryCleaned}`);
        }
      }
      
      // Update if needed
      if (needsUpdate) {
        await pool.query(
          `UPDATE applications 
           SET primary_skill = COALESCE($1, primary_skill),
               secondary_skill = COALESCE($2, secondary_skill)
           WHERE id = $3`,
          [primaryCleaned, secondaryCleaned, resume.id]
        );
        updatedCount++;
        console.log(`   ✅ Updated\n`);
      }
    }
    
    console.log('\n=== Cleanup Summary ===');
    console.log(`Total resumes checked: ${resumes.rows.length}`);
    console.log(`Resumes updated: ${updatedCount}`);
    console.log(`Resumes unchanged: ${resumes.rows.length - updatedCount}`);
    console.log('======================\n');
    
    console.log('✅ Skill cleanup completed!\n');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanSkills();
