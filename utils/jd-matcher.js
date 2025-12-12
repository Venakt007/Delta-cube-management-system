// Advanced JD Matching Algorithm with Multi-Level Fallback

// Comprehensive skill database with variations and related terms
const skillDatabase = {
  // Programming Languages
  'javascript': ['js', 'javascript', 'ecmascript', 'es6', 'es2015', 'node', 'nodejs'],
  'python': ['python', 'py', 'python3', 'django', 'flask', 'fastapi'],
  'java': ['java', 'jdk', 'jvm', 'spring', 'springboot', 'hibernate'],
  'typescript': ['typescript', 'ts'],
  'c++': ['c++', 'cpp', 'cplusplus'],
  'c#': ['c#', 'csharp', '.net', 'dotnet', 'asp.net'],
  'php': ['php', 'laravel', 'symfony', 'wordpress'],
  'ruby': ['ruby', 'rails', 'ruby on rails'],
  'go': ['go', 'golang'],
  'rust': ['rust'],
  'swift': ['swift', 'ios'],
  'kotlin': ['kotlin', 'android'],
  'scala': ['scala'],
  'r': ['r', 'r programming'],
  
  // Frontend
  'react': ['react', 'reactjs', 'react.js', 'react native'],
  'angular': ['angular', 'angularjs', 'angular2'],
  'vue': ['vue', 'vuejs', 'vue.js', 'nuxt'],
  'html': ['html', 'html5'],
  'css': ['css', 'css3', 'scss', 'sass', 'less'],
  'jquery': ['jquery'],
  'bootstrap': ['bootstrap'],
  'tailwind': ['tailwind', 'tailwindcss'],
  
  // Backend
  'node': ['node', 'nodejs', 'node.js', 'express', 'expressjs'],
  'django': ['django', 'python'],
  'flask': ['flask', 'python'],
  'spring': ['spring', 'springboot', 'spring boot', 'java'],
  'asp.net': ['asp.net', '.net', 'dotnet', 'c#'],
  
  // Databases
  'sql': ['sql', 'mysql', 'postgresql', 'postgres', 'mssql', 'oracle', 'sqlite'],
  'mongodb': ['mongodb', 'mongo', 'nosql'],
  'redis': ['redis'],
  'elasticsearch': ['elasticsearch', 'elastic'],
  'cassandra': ['cassandra'],
  'dynamodb': ['dynamodb', 'aws'],
  
  // Cloud & DevOps
  'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'cloudformation'],
  'azure': ['azure', 'microsoft azure'],
  'gcp': ['gcp', 'google cloud', 'google cloud platform'],
  'docker': ['docker', 'container', 'containerization'],
  'kubernetes': ['kubernetes', 'k8s', 'container orchestration'],
  'jenkins': ['jenkins', 'ci/cd'],
  'terraform': ['terraform', 'infrastructure as code', 'iac'],
  'ansible': ['ansible'],
  'git': ['git', 'github', 'gitlab', 'bitbucket', 'version control'],
  
  // Data Science & ML
  'machine learning': ['machine learning', 'ml', 'ai', 'artificial intelligence'],
  'deep learning': ['deep learning', 'neural network', 'cnn', 'rnn'],
  'tensorflow': ['tensorflow', 'tf'],
  'pytorch': ['pytorch'],
  'pandas': ['pandas', 'python'],
  'numpy': ['numpy', 'python'],
  'scikit-learn': ['scikit-learn', 'sklearn', 'python'],
  
  // Testing
  'jest': ['jest', 'testing'],
  'mocha': ['mocha', 'testing'],
  'junit': ['junit', 'testing', 'java'],
  'selenium': ['selenium', 'automation testing'],
  'cypress': ['cypress', 'e2e testing'],
  
  // Other
  'agile': ['agile', 'scrum', 'kanban'],
  'rest': ['rest', 'restful', 'rest api', 'api'],
  'graphql': ['graphql', 'gql'],
  'microservices': ['microservices', 'microservice architecture'],
  'linux': ['linux', 'unix'],
  'bash': ['bash', 'shell', 'shell scripting']
};

// LEVEL 1: Extract skills using skill database with variations
function extractSkillsLevel1(text) {
  const lowerText = text.toLowerCase();
  const foundSkills = new Set();
  
  console.log('🔍 LEVEL 1: Checking skill database...');
  
  // Check each skill category
  for (const [mainSkill, variations] of Object.entries(skillDatabase)) {
    for (const variation of variations) {
      // Use word boundaries to avoid partial matches
      // Escape special regex characters properly
      const escapedVariation = variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedVariation}\\b`, 'i');
      if (regex.test(lowerText)) {
        foundSkills.add(mainSkill);
        break; // Found this skill, move to next
      }
    }
  }
  
  console.log(`   ✓ Level 1 found ${foundSkills.size} skills`);
  return Array.from(foundSkills);
}

// LEVEL 2: Extract capitalized technical terms
function extractSkillsLevel2(text) {
  console.log('🔍 LEVEL 2: Extracting capitalized terms...');
  const foundSkills = new Set();
  
  // Look for capitalized words (likely technology names)
  const technicalTerms = text.match(/\b[A-Z][a-z]*(?:[A-Z][a-z]*)*\b/g) || [];
  
  technicalTerms.forEach(term => {
    const termLower = term.toLowerCase();
    // Check if it's a known skill variation
    for (const [mainSkill, variations] of Object.entries(skillDatabase)) {
      if (variations.some(v => v.toLowerCase() === termLower)) {
        foundSkills.add(mainSkill);
        break;
      }
    }
  });
  
  console.log(`   ✓ Level 2 found ${foundSkills.size} skills`);
  return Array.from(foundSkills);
}

// LEVEL 3: Extract from common patterns and keywords
function extractSkillsLevel3(text) {
  console.log('🔍 LEVEL 3: Pattern-based extraction...');
  const foundSkills = new Set();
  
  // Common patterns in JDs
  const patterns = [
    /(?:experience (?:with|in)|proficiency in|knowledge of|skilled in|expertise in)\s+([a-z0-9\s,./+#-]+)/gi,
    /(?:required skills|must have|should have|nice to have):\s*([a-z0-9\s,./+#-]+)/gi,
    /(?:technologies|tools|frameworks|languages):\s*([a-z0-9\s,./+#-]+)/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      const skillText = match[1];
      // Split by common separators
      const skills = skillText.split(/[,;|•·\n]/).map(s => s.trim());
      
      skills.forEach(skill => {
        if (skill.length > 2 && skill.length < 50) {
          // Check against skill database
          const skillLower = skill.toLowerCase();
          for (const [mainSkill, variations] of Object.entries(skillDatabase)) {
            if (variations.some(v => skillLower.includes(v))) {
              foundSkills.add(mainSkill);
              break;
            }
          }
        }
      });
    }
  });
  
  console.log(`   ✓ Level 3 found ${foundSkills.size} skills`);
  return Array.from(foundSkills);
}

// LEVEL 4: Load skills from database (dynamic keywords)
async function extractSkillsLevel4(text) {
  console.log('🔍 LEVEL 4: Checking database keywords...');
  const foundSkills = new Set();
  
  try {
    const pool = require('../config/db');
    
    // Get all unique skills from database
    const result = await pool.query(`
      SELECT DISTINCT 
        TRIM(UNNEST(STRING_TO_ARRAY(primary_skill, ','))) as skill
      FROM applications
      WHERE primary_skill IS NOT NULL AND primary_skill != ''
      UNION
      SELECT DISTINCT 
        TRIM(UNNEST(STRING_TO_ARRAY(secondary_skill, ','))) as skill
      FROM applications
      WHERE secondary_skill IS NOT NULL AND secondary_skill != ''
    `);
    
    const lowerText = text.toLowerCase();
    
    // Check each database skill
    result.rows.forEach(row => {
      const skill = row.skill.trim();
      if (skill && skill.length > 1) {
        const skillLower = skill.toLowerCase();
        const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
        if (regex.test(lowerText)) {
          foundSkills.add(skill);
        }
      }
    });
    
    console.log(`   ✓ Level 4 found ${foundSkills.size} skills from database`);
  } catch (error) {
    console.log('   ⚠️  Level 4 failed:', error.message);
  }
  
  return Array.from(foundSkills);
}

// LEVEL 5: Extract any word that looks technical (last resort)
function extractSkillsLevel5(text) {
  console.log('🔍 LEVEL 5: Extracting technical-looking terms...');
  const foundSkills = new Set();
  
  // Common technical suffixes/prefixes
  const technicalPatterns = [
    /\b\w+(?:js|py|sql|db|api|ui|ux|ml|ai|ci|cd)\b/gi,  // Ends with tech suffix
    /\b(?:web|mobile|cloud|data|full|back|front)[\w-]+/gi,  // Starts with tech prefix
  ];
  
  technicalPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      if (match.length > 2 && match.length < 30) {
        foundSkills.add(match);
      }
    });
  });
  
  console.log(`   ✓ Level 5 found ${foundSkills.size} technical terms`);
  return Array.from(foundSkills);
}

// Multi-level fallback skill extraction
async function extractSkills(text) {
  console.log('\n📋 Starting multi-level JD skill extraction...');
  const allSkills = new Set();
  
  // LEVEL 1: Skill database matching
  const level1Skills = extractSkillsLevel1(text);
  level1Skills.forEach(skill => allSkills.add(skill));
  
  // LEVEL 2: Capitalized terms
  const level2Skills = extractSkillsLevel2(text);
  level2Skills.forEach(skill => allSkills.add(skill));
  
  // LEVEL 3: Pattern-based extraction
  const level3Skills = extractSkillsLevel3(text);
  level3Skills.forEach(skill => allSkills.add(skill));
  
  // LEVEL 4: Database keywords (async)
  const level4Skills = await extractSkillsLevel4(text);
  level4Skills.forEach(skill => allSkills.add(skill));
  
  // LEVEL 5: Technical terms (only if we found very few skills)
  if (allSkills.size < 3) {
    console.log('⚠️  Found < 3 skills, trying Level 5...');
    const level5Skills = extractSkillsLevel5(text);
    level5Skills.forEach(skill => allSkills.add(skill));
  }
  
  const finalSkills = Array.from(allSkills);
  console.log(`✅ Total skills extracted: ${finalSkills.length}`);
  console.log(`   Skills: ${finalSkills.slice(0, 10).join(', ')}${finalSkills.length > 10 ? '...' : ''}`);
  
  return finalSkills;
}

// Extract years of experience from JD
function extractExperienceRequirement(jdText) {
  const lowerText = jdText.toLowerCase();
  
  // Patterns to match experience requirements
  const patterns = [
    /(\d+)\+?\s*(?:to|-)\s*(\d+)\s*years?/i,  // "3-5 years" or "3 to 5 years"
    /(\d+)\+\s*years?/i,                        // "3+ years"
    /minimum\s*(?:of\s*)?(\d+)\s*years?/i,     // "minimum 3 years"
    /at least\s*(\d+)\s*years?/i,              // "at least 3 years"
    /(\d+)\s*years?.*experience/i               // "3 years experience"
  ];
  
  for (const pattern of patterns) {
    const match = lowerText.match(pattern);
    if (match) {
      if (match[2]) {
        // Range found (e.g., "3-5 years")
        return {
          min: parseInt(match[1]),
          max: parseInt(match[2]),
          type: 'range'
        };
      } else {
        // Single value found
        return {
          min: parseInt(match[1]),
          max: null,
          type: 'minimum'
        };
      }
    }
  }
  
  return { min: 0, max: null, type: 'none' };
}

// Calculate skill match score with weighted importance
function calculateSkillMatch(candidateSkills, requiredSkills) {
  // If no skills required in JD, return low score (not 100%)
  if (requiredSkills.length === 0) {
    return { score: 0, matchingSkills: [], missingSkills: [], note: 'No skills detected in JD' };
  }
  
  // If candidate has no skills, return 0
  if (!candidateSkills || candidateSkills.length === 0) {
    return { score: 0, matchingSkills: [], missingSkills: requiredSkills, note: 'Candidate has no skills' };
  }
  
  const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase().trim());
  const matchingSkills = [];
  const missingSkills = [];
  
  for (const requiredSkill of requiredSkills) {
    let found = false;
    
    // Check if candidate has this skill or any variation
    if (skillDatabase[requiredSkill]) {
      for (const variation of skillDatabase[requiredSkill]) {
        // Use exact word matching to avoid false positives
        const variationLower = variation.toLowerCase();
        if (candidateSkillsLower.some(cs => {
          // Exact match or word boundary match
          return cs === variationLower || 
                 cs.includes(` ${variationLower} `) ||
                 cs.startsWith(`${variationLower} `) ||
                 cs.endsWith(` ${variationLower}`) ||
                 variationLower.includes(` ${cs} `) ||
                 variationLower.startsWith(`${cs} `) ||
                 variationLower.endsWith(` ${cs}`);
        })) {
          matchingSkills.push(requiredSkill);
          found = true;
          break;
        }
      }
    }
    
    // Direct match check with stricter matching
    if (!found) {
      const requiredLower = requiredSkill.toLowerCase();
      if (candidateSkillsLower.some(cs => {
        return cs === requiredLower || 
               cs.includes(` ${requiredLower} `) ||
               cs.startsWith(`${requiredLower} `) ||
               cs.endsWith(` ${requiredLower}`) ||
               requiredLower.includes(` ${cs} `) ||
               requiredLower.startsWith(`${cs} `) ||
               requiredLower.endsWith(` ${cs}`);
      })) {
        matchingSkills.push(requiredSkill);
        found = true;
      }
    }
    
    if (!found) {
      missingSkills.push(requiredSkill);
    }
  }
  
  // Calculate score based on JD requirements (not candidate skills)
  // This ensures that matching 1 out of 5 required skills = 20%, not 100%
  const score = requiredSkills.length > 0 
    ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
    : 0;
  
  return { score, matchingSkills, missingSkills };
}

// Calculate experience match score
function calculateExperienceMatch(candidateYears, requirement) {
  if (requirement.type === 'none') {
    return { score: 100, reason: 'No experience requirement specified' };
  }
  
  const years = parseFloat(candidateYears) || 0;
  
  if (requirement.type === 'range') {
    if (years >= requirement.min && years <= requirement.max) {
      return { score: 100, reason: `Perfect match (${years} years within ${requirement.min}-${requirement.max} range)` };
    } else if (years < requirement.min) {
      // Under-qualified
      const deficit = requirement.min - years;
      const score = Math.max(0, 100 - (deficit * 15)); // -15 points per year short
      return { score, reason: `${deficit} year(s) below minimum` };
    } else {
      // Over-qualified (not a negative)
      return { score: 100, reason: `Exceeds requirement (${years} years)` };
    }
  } else if (requirement.type === 'minimum') {
    if (years >= requirement.min) {
      return { score: 100, reason: `Meets minimum (${years} years >= ${requirement.min} years)` };
    } else {
      const deficit = requirement.min - years;
      const score = Math.max(0, 100 - (deficit * 15));
      return { score, reason: `${deficit} year(s) below minimum` };
    }
  }
  
  return { score: 100, reason: 'No specific requirement' };
}

// Main matching function
async function matchCandidateToJD(candidate, jdText) {
  try {
    // Validate inputs
    if (!candidate) {
      throw new Error('Candidate is required');
    }
    if (!jdText || typeof jdText !== 'string') {
      throw new Error('Job description must be a non-empty string');
    }
    
    // Extract requirements from JD (now async)
    const requiredSkills = await extractSkills(jdText);
    const experienceReq = extractExperienceRequirement(jdText);
    
    // Get candidate skills from multiple sources
    const candidateSkills = [
      ...(candidate.parsed_data?.skills || []),
      candidate.primary_skill,
      candidate.secondary_skill,
      candidate.technology
    ].filter(Boolean);
    
    // Debug logging (only in development)
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.log(`\n=== Matching ${candidate.name} ===`);
      console.log(`JD Required Skills (${requiredSkills.length}):`, requiredSkills.slice(0, 5));
      console.log(`Candidate Skills (${candidateSkills.length}):`, candidateSkills.slice(0, 5));
    }
    
    // Calculate skill match
    const skillMatch = calculateSkillMatch(candidateSkills, requiredSkills);
    
    if (isDev) {
      console.log(`Matching Skills (${skillMatch.matchingSkills.length}):`, skillMatch.matchingSkills);
      console.log(`Skill Score: ${skillMatch.score}%`);
    }
    
    // Calculate experience match
    const experienceMatch = calculateExperienceMatch(
      candidate.experience_years,
      experienceReq
    );
    
    if (isDev) {
      console.log(`Experience: ${candidate.experience_years} years`);
      console.log(`Experience Score: ${experienceMatch.score}%`);
    }
    
    // Calculate overall match percentage (weighted)
    // Skills: 70%, Experience: 30%
    // BUT: If no skills match at all (0%), return 0% overall (don't give credit for experience alone)
    let overallScore;
    
    if (skillMatch.score === 0) {
      // No skills match = 0% overall, regardless of experience
      overallScore = 0;
    } else {
      // Skills match, calculate weighted score
      overallScore = Math.round(
        (skillMatch.score * 0.7) + (experienceMatch.score * 0.3)
      );
    }
    
    if (isDev) {
      console.log(`Overall Score: ${overallScore}%`);
      console.log(`=== End Match ===\n`);
    }
    
    return {
      matchPercentage: overallScore,
      skillScore: skillMatch.score,
      experienceScore: experienceMatch.score,
      matchingSkills: skillMatch.matchingSkills,
      missingSkills: skillMatch.missingSkills,
      requiredSkills: requiredSkills,
      experienceRequirement: experienceReq,
      experienceReason: experienceMatch.reason,
      candidateExperience: candidate.experience_years
    };
  } catch (error) {
    console.error(`❌ Error matching candidate ${candidate?.name || 'unknown'}:`, error.message);
    // Return zero match on error instead of throwing
    return {
      matchPercentage: 0,
      skillScore: 0,
      experienceScore: 0,
      matchingSkills: [],
      missingSkills: [],
      requiredSkills: [],
      experienceRequirement: { min: 0, max: null, type: 'none' },
      experienceReason: 'Error during matching',
      candidateExperience: candidate?.experience_years || 0,
      error: error.message
    };
  }
}

module.exports = {
  matchCandidateToJD,
  extractSkills,
  extractExperienceRequirement
};
