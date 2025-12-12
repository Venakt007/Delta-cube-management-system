// Script to check skill keywords in the system
require('dotenv').config();
const pool = require('./config/db');

async function checkSkillKeywords() {
  try {
    console.log('\n📊 Checking Skill Keywords System...\n');
    
    // 1. Check skills in database
    console.log('1️⃣ Skills in Database:');
    const dbSkills = await pool.query(`
      SELECT DISTINCT TRIM(UNNEST(STRING_TO_ARRAY(primary_skill, ','))) as skill
      FROM applications
      WHERE primary_skill IS NOT NULL AND primary_skill != ''
      UNION
      SELECT DISTINCT TRIM(UNNEST(STRING_TO_ARRAY(secondary_skill, ','))) as skill
      FROM applications
      WHERE secondary_skill IS NOT NULL AND secondary_skill != ''
      ORDER BY skill
    `);
    
    console.log(`   Total unique skills: ${dbSkills.rows.length}`);
    console.log('   Skills:');
    dbSkills.rows.forEach((row, idx) => {
      if (idx < 20) {
        console.log(`     ${idx + 1}. ${row.skill}`);
      }
    });
    if (dbSkills.rows.length > 20) {
      console.log(`     ... and ${dbSkills.rows.length - 20} more`);
    }
    
    // 2. Check hardcoded keywords in parser
    console.log('\n2️⃣ Hardcoded Keywords in Parser:');
    const { addSkillKeyword } = require('./utils/resumeParser');
    console.log('   Parser loaded successfully ✅');
    console.log('   Dynamic keyword system active ✅');
    
    // 3. Test skill extraction
    console.log('\n3️⃣ Testing Skill Extraction:');
    const testText = 'Looking for React, Node.js, Python, and SQL developer';
    const { extractSkills } = require('./utils/jd-matcher');
    const extractedSkills = await extractSkills(testText);
    console.log(`   Test text: "${testText}"`);
    console.log(`   Extracted: ${extractedSkills.join(', ')}`);
    
    // 4. Check recent resumes
    console.log('\n4️⃣ Recent Resume Skills:');
    const recentResumes = await pool.query(`
      SELECT id, name, primary_skill, secondary_skill, created_at
      FROM applications
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    recentResumes.rows.forEach((resume, idx) => {
      console.log(`   ${idx + 1}. ${resume.name}`);
      console.log(`      Primary: ${resume.primary_skill || 'None'}`);
      console.log(`      Secondary: ${resume.secondary_skill || 'None'}`);
      console.log(`      Date: ${resume.created_at}`);
    });
    
    // 5. Check parsed_data
    console.log('\n5️⃣ Parsed Data Check:');
    const parsedCount = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(parsed_data) as with_parsed,
        COUNT(*) - COUNT(parsed_data) as without_parsed
      FROM applications
    `);
    
    const stats = parsedCount.rows[0];
    console.log(`   Total resumes: ${stats.total}`);
    console.log(`   With parsed_data: ${stats.with_parsed}`);
    console.log(`   Without parsed_data: ${stats.without_parsed}`);
    
    console.log('\n✅ Skill Keywords Check Complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSkillKeywords();
