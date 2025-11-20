const express = require('express');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is system admin
const isSystemAdmin = (req, res, next) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({ error: 'Access denied. System admin only.' });
  }
  next();
};

// Get resumes uploaded by System Admin only
router.get('/all-resumes', auth, isSystemAdmin, async (req, res) => {
  try {
    const { showOnboarded } = req.query;
    
    let query = `SELECT a.*, u.name as uploader_name, u.email as uploader_email
      FROM applications a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.uploaded_by = $1`;
    
    const params = [req.user.id];
    
    if (showOnboarded === 'only') {
      // Show only Onboarded resumes
      query += ` AND a.placement_status = 'Onboarded'`;
    } else if (showOnboarded !== 'true') {
      // Default: exclude Onboarded resumes
      query += ` AND (a.placement_status IS NULL OR a.placement_status <> 'Onboarded')`;
    }
    
    query += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(query, params);

    console.log(`📊 System Admin fetched ${result.rows.length} resumes (showOnboarded: ${showOnboarded || 'false'})`);

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// JD Matching for system admin
router.post('/jd-match', auth, isSystemAdmin, async (req, res) => {
  try {
    const { jobDescription } = req.body;

    // Get JD analysis from admin route (reuse the logic)
    const adminRouter = require('./admin');
    const jdAnalysis = await analyzeJobDescription(jobDescription);
    
    if (!jdAnalysis) {
      return res.status(400).json({ error: 'Failed to analyze job description' });
    }

    // Get system admin's resumes only
    const resumes = await pool.query(
      `SELECT a.* 
       FROM applications a 
       WHERE a.uploaded_by = $1 AND (a.placement_status IS NULL OR a.placement_status <> 'Onboarded')`,
      [req.user.id]
    );

    // Calculate match for each resume
    const matches = resumes.rows.map(resume => {
      const matchResult = calculateMatch(jdAnalysis, resume);
      return {
        ...resume,
        matchPercentage: matchResult.percentage,
        matchingSkills: matchResult.matchingSkills,
        missingSkills: matchResult.missingSkills,
        experienceMatch: matchResult.experienceMatch
      };
    });

    // Sort by match percentage
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      jdAnalysis,
      matches: matches.filter(m => m.matchPercentage > 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'JD matching failed' });
  }
});

// Helper functions (copied from admin.js)
async function analyzeJobDescription(jd) {
  const axios = require('axios');
  try {
    console.log('🔍 Analyzing job description with AI...');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
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
    return parseJobDescriptionBasic(jd);
  }
}

function parseJobDescriptionBasic(jd) {
  console.log('🔍 Using basic JD parsing (no AI)...');
  const jdLower = jd.toLowerCase();
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue',
    'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'GCP',
    'Docker', 'Kubernetes', 'Git', 'REST', 'GraphQL', 'Jenkins', 'CI/CD',
    'HTML', 'CSS', 'Redux', 'Express', 'Django', 'Flask', 'Spring', 'Laravel'
  ];
  
  const requiredSkills = [];
  commonSkills.forEach(skill => {
    if (jdLower.includes(skill.toLowerCase())) {
      requiredSkills.push(skill);
    }
  });
  
  let minExp = 0;
  let maxExp = 100;
  const expMatch = jd.match(/(\d+)[\s-]+(?:to|-)[\s-]+(\d+)\s*(?:\+)?\s*years?/i);
  if (expMatch) {
    minExp = parseInt(expMatch[1]);
    maxExp = parseInt(expMatch[2]);
  }
  
  console.log('✅ Basic parsing complete');
  return {
    required_skills: [...new Set(requiredSkills)],
    preferred_skills: [],
    min_experience: minExp,
    max_experience: maxExp,
    location: '',
    job_type: 'regular',
    education: [],
    key_responsibilities: []
  };
}

function calculateMatch(jdAnalysis, resume) {
  let totalScore = 0;
  let maxScore = 0;

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

// Get statistics for system admin
router.get('/stats', auth, isSystemAdmin, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN source = 'html_form' THEN 1 END) as form_submissions,
        COUNT(CASE WHEN source = 'dashboard' THEN 1 END) as recruiter_uploads,
        COUNT(CASE WHEN placement_status = 'Onboarded' THEN 1 END) as onboarded_count,
        COUNT(CASE WHEN placement_status = 'Bench' THEN 1 END) as bench_count,
        COUNT(DISTINCT uploaded_by) as active_recruiters
      FROM applications
    `);

    const recruiterStats = await pool.query(`
      SELECT 
        u.name as recruiter_name,
        u.email as recruiter_email,
        COUNT(a.id) as total_uploads,
        COUNT(CASE WHEN a.placement_status = 'Onboarded' THEN 1 END) as onboarded,
        COUNT(CASE WHEN a.placement_status = 'Bench' THEN 1 END) as bench
      FROM users u
      LEFT JOIN applications a ON u.id = a.uploaded_by
      WHERE u.role = 'recruiter'
      GROUP BY u.id, u.name, u.email
      ORDER BY total_uploads DESC
    `);

    res.json({
      overall: stats.rows[0],
      byRecruiter: recruiterStats.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
