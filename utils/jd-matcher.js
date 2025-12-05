// Advanced JD Matching Algorithm

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

// Extract skills from text with better accuracy
function extractSkills(text) {
  const lowerText = text.toLowerCase();
  const foundSkills = new Set();
  
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
  
  // Also extract any technical terms that might not be in our database
  // Look for capitalized words or common patterns
  const technicalTerms = text.match(/\b[A-Z][a-z]*(?:[A-Z][a-z]*)*\b/g) || [];
  const commonTechPatterns = text.match(/\b(?:programming|development|framework|library|database|cloud|devops|testing|api|backend|frontend|fullstack|full-stack)\b/gi) || [];
  
  // Add these as potential skills if not already found
  [...technicalTerms, ...commonTechPatterns].forEach(term => {
    const termLower = term.toLowerCase();
    // Only add if it's not already in our found skills and looks technical
    if (term.length > 2 && !foundSkills.has(termLower)) {
      // Check if it's a known skill variation
      for (const [mainSkill, variations] of Object.entries(skillDatabase)) {
        if (variations.some(v => v.toLowerCase() === termLower)) {
          foundSkills.add(mainSkill);
          break;
        }
      }
    }
  });
  
  return Array.from(foundSkills);
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
function matchCandidateToJD(candidate, jdText) {
  // Extract requirements from JD
  const requiredSkills = extractSkills(jdText);
  const experienceReq = extractExperienceRequirement(jdText);
  
  // Get candidate skills from multiple sources
  const candidateSkills = [
    ...(candidate.parsed_data?.skills || []),
    candidate.primary_skill,
    candidate.secondary_skill,
    candidate.technology
  ].filter(Boolean);
  
  // Debug logging
  console.log(`\n=== Matching ${candidate.name} ===`);
  console.log(`JD Required Skills (${requiredSkills.length}):`, requiredSkills);
  console.log(`Candidate Skills (${candidateSkills.length}):`, candidateSkills);
  
  // Calculate skill match
  const skillMatch = calculateSkillMatch(candidateSkills, requiredSkills);
  
  console.log(`Matching Skills (${skillMatch.matchingSkills.length}):`, skillMatch.matchingSkills);
  console.log(`Missing Skills (${skillMatch.missingSkills.length}):`, skillMatch.missingSkills);
  console.log(`Skill Score: ${skillMatch.score}%`);
  
  // Calculate experience match
  const experienceMatch = calculateExperienceMatch(
    candidate.experience_years,
    experienceReq
  );
  
  console.log(`Experience: ${candidate.experience_years} years (Required: ${JSON.stringify(experienceReq)})`);
  console.log(`Experience Score: ${experienceMatch.score}%`);
  
  // Calculate overall match percentage (weighted)
  // Skills: 70%, Experience: 30%
  const overallScore = Math.round(
    (skillMatch.score * 0.7) + (experienceMatch.score * 0.3)
  );
  
  console.log(`Overall Score: ${overallScore}% (${skillMatch.score}% × 0.7 + ${experienceMatch.score}% × 0.3)`);
  console.log(`=== End Match ===\n`);
  
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
}

module.exports = {
  matchCandidateToJD,
  extractSkills,
  extractExperienceRequirement
};
