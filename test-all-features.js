// Comprehensive Test Suite for All Features
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testResumeId = null;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  log(`🧪 TEST: ${testName}`, 'blue');
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test 1: Login
async function testLogin() {
  logTest('User Login');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'Indu@deltacubs.us',
      password: 'admin123'
    });
    
    if (response.data.token) {
      authToken = response.data.token;
      logSuccess(`Login successful! Token: ${authToken.substring(0, 20)}...`);
      logSuccess(`User: ${response.data.user.name} (${response.data.user.role})`);
      return true;
    } else {
      logError('No token received');
      return false;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test 2: Manual Entry with Skills
async function testManualEntry() {
  logTest('Manual Entry - Create Profile with Skills');
  try {
    const formData = new FormData();
    formData.append('name', 'Test Candidate Manual');
    formData.append('email', `test.manual.${Date.now()}@example.com`);
    formData.append('phone', '+1234567890');
    formData.append('linkedin', 'https://linkedin.com/in/testcandidate');
    formData.append('technology', 'Web Development');
    formData.append('primary_skill', 'React');
    formData.append('secondary_skill', 'Node.js');
    formData.append('location', 'New York');
    formData.append('experience_years', '5');
    formData.append('job_types', 'Full time, Consultant');
    formData.append('action', 'new');
    
    const response = await axios.post(`${BASE_URL}/api/applications/manual-entry`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.id) {
      testResumeId = response.data.id;
      logSuccess(`Profile created successfully! ID: ${testResumeId}`);
      logSuccess(`Message: ${response.data.message}`);
      
      // Verify the profile was saved with skills
      const verifyResponse = await axios.get(`${BASE_URL}/api/applications/my-resumes`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const savedProfile = verifyResponse.data.find(r => r.id === testResumeId);
      if (savedProfile) {
        logSuccess(`Profile verified in database`);
        log(`  Name: ${savedProfile.name}`);
        log(`  Primary Skill: ${savedProfile.primary_skill}`);
        log(`  Secondary Skill: ${savedProfile.secondary_skill}`);
        log(`  Parsed Data: ${savedProfile.parsed_data ? 'Yes' : 'No'}`);
        if (savedProfile.parsed_data) {
          const parsed = JSON.parse(savedProfile.parsed_data);
          log(`  Skills in parsed_data: ${parsed.skills?.join(', ') || 'None'}`);
        }
      }
      
      return true;
    } else {
      logError('No ID returned');
      return false;
    }
  } catch (error) {
    logError(`Manual entry failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test 3: Search by Skill
async function testSearchBySkill() {
  logTest('Search Functionality - Search by Skill');
  try {
    // Search for React
    log('Searching for "React"...');
    const response = await axios.get(`${BASE_URL}/api/applications/my-resumes/search?skill=React`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess(`Found ${response.data.length} resume(s) with "React"`);
    
    if (response.data.length > 0) {
      response.data.forEach((resume, idx) => {
        log(`  ${idx + 1}. ${resume.name} - ${resume.primary_skill} - ${resume.experience_years} years`);
      });
      
      // Verify our test resume is in the results
      const foundTestResume = response.data.find(r => r.id === testResumeId);
      if (foundTestResume) {
        logSuccess('Test resume found in search results!');
      } else {
        logWarning('Test resume NOT found in search results');
      }
    }
    
    // Search for Node.js
    log('\nSearching for "Node.js"...');
    const response2 = await axios.get(`${BASE_URL}/api/applications/my-resumes/search?skill=Node.js`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess(`Found ${response2.data.length} resume(s) with "Node.js"`);
    
    // Search for non-existent skill
    log('\nSearching for "Nonexistent Skill"...');
    const response3 = await axios.get(`${BASE_URL}/api/applications/my-resumes/search?skill=NonexistentSkill123`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response3.data.length === 0) {
      logSuccess('Correctly returned 0 results for non-existent skill');
    } else {
      logWarning(`Found ${response3.data.length} results for non-existent skill (unexpected)`);
    }
    
    return true;
  } catch (error) {
    logError(`Search failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test 4: Filter by Experience
async function testFilterByExperience() {
  logTest('Filter Functionality - Filter by Experience');
  try {
    log('Filtering for 3-7 years experience...');
    const response = await axios.get(`${BASE_URL}/api/applications/my-resumes/search?experience_min=3&experience_max=7`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess(`Found ${response.data.length} resume(s) with 3-7 years experience`);
    
    if (response.data.length > 0) {
      response.data.forEach((resume, idx) => {
        log(`  ${idx + 1}. ${resume.name} - ${resume.experience_years} years`);
        if (resume.experience_years < 3 || resume.experience_years > 7) {
          logWarning(`    ⚠️  Experience ${resume.experience_years} is outside range!`);
        }
      });
    }
    
    return true;
  } catch (error) {
    logError(`Filter failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test 5: JD Matching
async function testJDMatching() {
  logTest('JD Matching - Match Candidates to Job Description');
  try {
    const jobDescription = `
      We are looking for a Senior React Developer with 4-6 years of experience.
      
      Required Skills:
      - React.js
      - Node.js
      - JavaScript
      - TypeScript
      - REST APIs
      
      Preferred Skills:
      - AWS
      - Docker
      - MongoDB
      
      Location: Remote
    `;
    
    log('Job Description:');
    log(jobDescription.trim());
    log('\nMatching candidates...');
    
    const response = await axios.post(`${BASE_URL}/api/applications/jd-match-social`, {
      jobDescription
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess(`Found ${response.data.matches.length} matching candidate(s)`);
    
    if (response.data.matches.length > 0) {
      response.data.matches.forEach((match, idx) => {
        log(`\n  ${idx + 1}. ${match.name} - ${match.matchPercentage}% match`);
        log(`     Experience: ${match.experience_years} years`);
        log(`     Matching Skills: ${match.matchingSkills?.join(', ') || 'None'}`);
        log(`     Missing Skills: ${match.missingSkills?.join(', ') || 'None'}`);
      });
    } else {
      logWarning('No matches found');
    }
    
    return true;
  } catch (error) {
    logError(`JD matching failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test 6: Status Update
async function testStatusUpdate() {
  logTest('Status Update - Update Recruitment Status');
  try {
    if (!testResumeId) {
      logWarning('No test resume ID available, skipping status update test');
      return false;
    }
    
    log(`Updating status for resume ID: ${testResumeId}`);
    
    const response = await axios.patch(`${BASE_URL}/api/applications/resumes/${testResumeId}/status`, {
      status: 'Interview scheduled',
      statusType: 'recruitment'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess(`Status updated successfully!`);
    log(`  New status: ${response.data.resume.recruitment_status}`);
    
    // Update placement status
    const response2 = await axios.patch(`${BASE_URL}/api/applications/resumes/${testResumeId}/status`, {
      status: 'Bench',
      statusType: 'placement'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess(`Placement status updated successfully!`);
    log(`  New placement status: ${response2.data.resume.placement_status}`);
    
    return true;
  } catch (error) {
    logError(`Status update failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test 7: Admin Assignment
async function testAdminAssignment() {
  logTest('Admin Assignment - Assign Resume to Admin');
  try {
    if (!testResumeId) {
      logWarning('No test resume ID available, skipping assignment test');
      return false;
    }
    
    // Get list of admins
    const adminsResponse = await axios.get(`${BASE_URL}/api/applications/admins-list`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (adminsResponse.data.length === 0) {
      logWarning('No admins available for assignment');
      return false;
    }
    
    const firstAdmin = adminsResponse.data[0];
    log(`Assigning resume to admin: ${firstAdmin.name} (${firstAdmin.email})`);
    
    const response = await axios.patch(`${BASE_URL}/api/applications/resumes/${testResumeId}/assign`, {
      adminId: firstAdmin.id
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess(`Resume assigned successfully!`);
    log(`  Assigned to: ${firstAdmin.name}`);
    log(`  Assigned at: ${response.data.resume.assigned_at}`);
    
    return true;
  } catch (error) {
    logError(`Assignment failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test 8: Fetch All Resumes
async function testFetchAllResumes() {
  logTest('Fetch All Resumes - Verify Data Integrity');
  try {
    const response = await axios.get(`${BASE_URL}/api/applications/my-resumes`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess(`Fetched ${response.data.length} resume(s)`);
    
    if (response.data.length > 0) {
      log('\nData Integrity Check:');
      let issuesFound = 0;
      
      response.data.forEach((resume, idx) => {
        log(`\n  ${idx + 1}. ${resume.name}`);
        
        // Check for missing data
        if (!resume.email) {
          logWarning(`    Missing email`);
          issuesFound++;
        }
        if (!resume.phone) {
          logWarning(`    Missing phone`);
          issuesFound++;
        }
        if (!resume.primary_skill) {
          logWarning(`    Missing primary_skill`);
          issuesFound++;
        }
        if (!resume.parsed_data) {
          logWarning(`    Missing parsed_data`);
          issuesFound++;
        } else {
          const parsed = JSON.parse(resume.parsed_data);
          if (!parsed.skills || parsed.skills.length === 0) {
            logWarning(`    No skills in parsed_data`);
            issuesFound++;
          } else {
            log(`    Skills: ${parsed.skills.join(', ')}`);
          }
        }
        
        log(`    Experience: ${resume.experience_years} years`);
        log(`    Status: ${resume.recruitment_status || 'Pending'}`);
        log(`    Placement: ${resume.placement_status || 'None'}`);
      });
      
      if (issuesFound === 0) {
        logSuccess('\nNo data integrity issues found!');
      } else {
        logWarning(`\nFound ${issuesFound} data integrity issue(s)`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`Fetch failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test 9: Cleanup - Delete Test Resume
async function testCleanup() {
  logTest('Cleanup - Delete Test Resume');
  try {
    if (!testResumeId) {
      logWarning('No test resume ID available, skipping cleanup');
      return false;
    }
    
    log(`Deleting test resume ID: ${testResumeId}`);
    
    const response = await axios.delete(`${BASE_URL}/api/applications/delete/${testResumeId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess(`Test resume deleted successfully!`);
    log(`  Message: ${response.data.message}`);
    
    return true;
  } catch (error) {
    logError(`Cleanup failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     COMPREHENSIVE FEATURE TEST SUITE                     ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Manual Entry', fn: testManualEntry },
    { name: 'Search by Skill', fn: testSearchBySkill },
    { name: 'Filter by Experience', fn: testFilterByExperience },
    { name: 'JD Matching', fn: testJDMatching },
    { name: 'Status Update', fn: testStatusUpdate },
    { name: 'Admin Assignment', fn: testAdminAssignment },
    { name: 'Fetch All Resumes', fn: testFetchAllResumes },
    { name: 'Cleanup', fn: testCleanup }
  ];
  
  for (const test of tests) {
    results.total++;
    const success = await test.fn();
    if (success) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Final summary
  console.log('\n');
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     TEST SUMMARY                                          ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');
  
  log(`Total Tests: ${results.total}`);
  logSuccess(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`);
  } else {
    logSuccess(`Failed: ${results.failed}`);
  }
  
  const percentage = Math.round((results.passed / results.total) * 100);
  log(`\nSuccess Rate: ${percentage}%`, percentage === 100 ? 'green' : 'yellow');
  
  console.log('\n');
}

// Run the tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
