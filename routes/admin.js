const express = require('express');
const pool = require('../config/db');
const { auth, isAdmin } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Get all resumes (HTML form + all recruiters) - Can filter by placement status
router.get('/resumes', auth, isAdmin, async (req, res) => {
  try {
    const { showOnboarded } = req.query;
    
    let query = `SELECT a.*, u.name as uploader_name, u.email as uploader_email
      FROM applications a
      LEFT JOIN users u ON a.uploaded_by = u.id`;
    
    if (showOnboarded === 'only') {
      // Show only Onboarded resumes
      query += ` WHERE a.placement_status = 'Onboarded'`;
    } else if (showOnboarded !== 'true') {
      // Default: exclude Onboarded resumes
      query += ` WHERE (a.placement_status IS NULL OR a.placement_status <> 'Onboarded')`;
    }
    // If showOnboarded === 'true', show all resumes
    
    query += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(query);

    console.log(`📊 Admin fetched ${result.rows.length} resumes (showOnboarded: ${showOnboarded || 'false'})`);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Advanced filter - Exclude "Onboarded" placement status
router.get('/resumes/filter', auth, isAdmin, async (req, res) => {
  try {
    const { skills, experience_min, experience_max, job_type, location, technology } = req.query;
    
    let query = `SELECT a.*, u.name as uploader_name, u.email as uploader_email
                 FROM applications a
                 LEFT JOIN users u ON a.uploaded_by = u.id
                 WHERE (a.placement_status IS NULL OR a.placement_status <> 'Onboarded')`;
    const params = [];
    let paramCount = 0;

    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      paramCount++;
      query += ` AND (`;
      const skillConditions = skillArray.map((_, idx) => {
        params.push(`%${skillArray[idx]}%`);
        return `primary_skill ILIKE $${params.length} OR secondary_skill ILIKE $${params.length} OR parsed_data::text ILIKE $${params.length}`;
      });
      query += skillConditions.join(' OR ') + ')';
    }

    if (experience_min) {
      paramCount++;
      params.push(experience_min);
      query += ` AND experience_years >= $${params.length}`;
    }

    if (experience_max) {
      paramCount++;
      params.push(experience_max);
      query += ` AND experience_years <= $${params.length}`;
    }

    if (location) {
      paramCount++;
      params.push(`%${location}%`);
      query += ` AND location ILIKE $${params.length}`;
    }

    if (technology) {
      paramCount++;
      params.push(`%${technology}%`);
      query += ` AND technology ILIKE $${params.length}`;
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Filter failed' });
  }
});

// JD Matching
router.post('/jd-match', auth, isAdmin, async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const { matchCandidateToJD } = require('../utils/jd-matcher');

    // Get all resumes - Exclude "Onboarded" placement status
    const resumes = await pool.query(
      `SELECT a.*, u.name as uploader_name 
       FROM applications a 
       LEFT JOIN users u ON a.uploaded_by = u.id
       WHERE (a.placement_status IS NULL OR a.placement_status <> 'Onboarded')`
    );

    // Use advanced matching algorithm
    const matches = resumes.rows.map(resume => {
      const matchResult = matchCandidateToJD(resume, jobDescription);
      return {
        ...resume,
        ...matchResult
      };
    });

    // Sort by match percentage
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      matches: matches.filter(m => m.matchPercentage > 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'JD matching failed' });
  }
});

// Helper: Analyze Job Description with AI
async function analyzeJobDescription(jd) {
  try {
    console.log('🔍 Analyzing job description with AI...');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // Changed from gpt-4 to gpt-3.5-turbo
        messages: [
          {
            role: 'system',
            content: 'Extract key requirements from job descriptions and return JSON only.'
          },
          {
            role: 'user',
            content: `Analyze this job description and extract:
{
  "required_skills": ["skill1", "skill2", ...],
  "preferred_skills": ["skill1", "skill2", ...],
  "min_experience": number,
  "max_experience": number,
  "location": "location",
  "job_type": "freelance/regular/contract",
  "education": ["requirement1", ...],
  "key_responsibilities": ["resp1", "resp2", ...]
}

Job Description:
${jd}

Return ONLY the JSON object.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices[0].message.content.trim();
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(jsonStr);
    console.log('✅ AI analysis successful');
    return parsed;
  } catch (error) {
    console.error('❌ AI analysis error:', error.response?.data || error.message);
    console.log('⚠️  Falling back to basic JD parsing...');
    
    // Fallback: Basic regex-based parsing
    return parseJobDescriptionBasic(jd);
  }
}

// Fallback: Basic JD parsing without AI
function parseJobDescriptionBasic(jd) {
  console.log('🔍 Using basic JD parsing (no AI)...');
  
  const jdLower = jd.toLowerCase();
  
  // Common tech skills to look for
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue',
    'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'GCP',
    'Docker', 'Kubernetes', 'Git', 'REST', 'GraphQL', 'Jenkins', 'CI/CD',
    'HTML', 'CSS', 'Redux', 'Express', 'Django', 'Flask', 'Spring', 'Laravel'
  ];
  
  // Extract skills mentioned in JD
  const requiredSkills = [];
  const preferredSkills = [];
  
  commonSkills.forEach(skill => {
    if (jdLower.includes(skill.toLowerCase())) {
      // Check if it's in a "required" section
      const requiredSection = jd.match(/required.*?(?=preferred|experience|location|$)/is);
      if (requiredSection && requiredSection[0].toLowerCase().includes(skill.toLowerCase())) {
        requiredSkills.push(skill);
      } else {
        // Check if it's in a "preferred" section
        const preferredSection = jd.match(/preferred.*?(?=required|experience|location|$)/is);
        if (preferredSection && preferredSection[0].toLowerCase().includes(skill.toLowerCase())) {
          preferredSkills.push(skill);
        } else {
          // Default to required if not clearly marked
          requiredSkills.push(skill);
        }
      }
    }
  });
  
  // Extract experience
  let minExp = 0;
  let maxExp = 100;
  
  const expMatch = jd.match(/(\d+)[\s-]+(?:to|-)[\s-]+(\d+)\s*(?:\+)?\s*years?/i);
  if (expMatch) {
    minExp = parseInt(expMatch[1]);
    maxExp = parseInt(expMatch[2]);
  } else {
    const singleExpMatch = jd.match(/(\d+)\+?\s*years?/i);
    if (singleExpMatch) {
      minExp = parseInt(singleExpMatch[1]);
      maxExp = minExp + 5;
    }
  }
  
  // Extract location
  let location = '';
  const locationMatch = jd.match(/location[:\s]+([^\n]+)/i);
  if (locationMatch) {
    location = locationMatch[1].trim();
  }
  
  // Extract job type
  let jobType = 'regular';
  if (jdLower.includes('freelance')) jobType = 'freelance';
  else if (jdLower.includes('contract')) jobType = 'contract';
  else if (jdLower.includes('remote')) jobType = 'remote';
  
  console.log('✅ Basic parsing complete');
  
  return {
    required_skills: [...new Set(requiredSkills)], // Remove duplicates
    preferred_skills: [...new Set(preferredSkills)],
    min_experience: minExp,
    max_experience: maxExp,
    location: location,
    job_type: jobType,
    education: [],
    key_responsibilities: []
  };
}

// Helper: Calculate match percentage
function calculateMatch(jdAnalysis, resume) {
  let totalScore = 0;
  let maxScore = 0;

  // Skills matching (60% weight)
  const requiredSkills = jdAnalysis.required_skills || [];
  const preferredSkills = jdAnalysis.preferred_skills || [];
  const candidateSkills = [
    ...(resume.parsed_data?.skills || []),
    resume.primary_skill,
    resume.secondary_skill
  ].filter(Boolean).map(s => s.toLowerCase());

  const matchingRequired = requiredSkills.filter(skill => 
    candidateSkills.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );
  const matchingPreferred = preferredSkills.filter(skill => 
    candidateSkills.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );

  const skillScore = (matchingRequired.length / Math.max(requiredSkills.length, 1)) * 60;
  const preferredScore = (matchingPreferred.length / Math.max(preferredSkills.length, 1)) * 20;
  totalScore += skillScore + (preferredScore * 0.5);
  maxScore += 60;

  // Experience matching (30% weight)
  const candidateExp = resume.experience_years || resume.parsed_data?.experience_years || 0;
  const minExp = jdAnalysis.min_experience || 0;
  const maxExp = jdAnalysis.max_experience || 100;

  let expScore = 0;
  if (candidateExp >= minExp && candidateExp <= maxExp) {
    expScore = 30;
  } else if (candidateExp >= minExp) {
    expScore = 25;
  } else {
    expScore = (candidateExp / minExp) * 20;
  }
  totalScore += expScore;
  maxScore += 30;

  // Location matching (10% weight)
  if (jdAnalysis.location && resume.location) {
    if (resume.location.toLowerCase().includes(jdAnalysis.location.toLowerCase())) {
      totalScore += 10;
    }
  }
  maxScore += 10;

  const percentage = Math.round((totalScore / maxScore) * 100);

  return {
    percentage,
    matchingSkills: [...matchingRequired, ...matchingPreferred],
    missingSkills: requiredSkills.filter(skill => !matchingRequired.includes(skill)),
    experienceMatch: candidateExp >= minExp && candidateExp <= maxExp
  };
}

// Get statistics
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN source = 'html_form' THEN 1 END) as form_submissions,
        COUNT(CASE WHEN source = 'dashboard' THEN 1 END) as recruiter_uploads,
        COUNT(DISTINCT uploaded_by) as active_recruiters
      FROM applications
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get resumes assigned to this admin
router.get('/assigned-resumes', auth, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as uploader_name, u.email as uploader_email
       FROM applications a
       LEFT JOIN users u ON a.uploaded_by = u.id
       WHERE a.assigned_to = $1
       ORDER BY a.assigned_at DESC, a.created_at DESC`,
      [req.user.id]
    );

    console.log(`📋 Admin ${req.user.id} fetched ${result.rows.length} assigned resumes`);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching assigned resumes:', error);
    res.status(500).json({ error: 'Failed to fetch assigned resumes' });
  }
});

module.exports = router;
