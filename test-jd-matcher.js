// Test script for JD Matcher
const { matchCandidateToJD, extractSkills } = require('./utils/jd-matcher');

// Test JD
const testJD = `
We are looking for a Senior Full Stack Developer with the following skills:
- React.js and Node.js experience
- 5+ years of professional experience
- Strong knowledge of JavaScript, TypeScript
- Experience with AWS, Docker, and Kubernetes
- Agile methodology experience
- SQL and MongoDB databases
`;

console.log('='.repeat(60));
console.log('TESTING JD MATCHER');
console.log('='.repeat(60));

console.log('\n1. Testing Skill Extraction from JD:');
console.log('JD Text:', testJD);
const extractedSkills = extractSkills(testJD);
console.log('\nExtracted Skills:', extractedSkills);
console.log('Total Skills Found:', extractedSkills.length);

console.log('\n' + '='.repeat(60));
console.log('2. Testing Candidate Matching:');
console.log('='.repeat(60));

// Test Candidate 1: Only has "agile"
const candidate1 = {
  name: 'Aayush Jaiswal',
  primary_skill: 'agile',
  secondary_skill: null,
  technology: null,
  experience_years: 5,
  parsed_data: { skills: [] }
};

console.log('\n--- Candidate 1: Only Agile ---');
const result1 = matchCandidateToJD(candidate1, testJD);
console.log('Expected: Low percentage (1 skill out of many)');
console.log('Actual Result:', result1.matchPercentage + '%');

// Test Candidate 2: Has multiple matching skills
const candidate2 = {
  name: 'Test Candidate',
  primary_skill: 'React, Node.js, JavaScript',
  secondary_skill: 'AWS, Docker',
  technology: 'Full Stack Development',
  experience_years: 6,
  parsed_data: { skills: ['react', 'node', 'javascript', 'aws', 'docker'] }
};

console.log('\n--- Candidate 2: Multiple Skills ---');
const result2 = matchCandidateToJD(candidate2, testJD);
console.log('Expected: High percentage (most skills match)');
console.log('Actual Result:', result2.matchPercentage + '%');

// Test Candidate 3: No matching skills
const candidate3 = {
  name: 'No Match Candidate',
  primary_skill: 'PHP',
  secondary_skill: 'Laravel',
  technology: 'Backend',
  experience_years: 3,
  parsed_data: { skills: ['php', 'laravel'] }
};

console.log('\n--- Candidate 3: No Matching Skills ---');
const result3 = matchCandidateToJD(candidate3, testJD);
console.log('Expected: Very low or 0%');
console.log('Actual Result:', result3.matchPercentage + '%');

console.log('\n' + '='.repeat(60));
console.log('TEST COMPLETE');
console.log('='.repeat(60));
