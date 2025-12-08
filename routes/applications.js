const express = require('express');
const pool = require('../config/db');
// Use Cloudinary in production (Render), local storage in development
const upload = process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_CLOUD_NAME
  ? require('../middleware/upload-cloudinary')
  : require('../middleware/upload');
const { parseResume } = require('../utils/resumeParser');
const { auth, isRecruiterOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Public form submission
router.post('/submit', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'id_proof', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, phone, linkedin, technology, primary_skill, secondary_skill, location, experience_years, job_types, referral_source } = req.body;
    
    // Validate and sanitize numeric fields
    const sanitizedExperienceYears = experience_years && experience_years !== '' ? parseFloat(experience_years) : 0;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const resumeUrl = req.files['resume'] ? `/uploads/${req.files['resume'][0].filename}` : null;
    const idProofUrl = req.files['id_proof'] ? `/uploads/${req.files['id_proof'][0].filename}` : null;

    // Parse resume
    let parsedData = null;
    if (req.files['resume']) {
      parsedData = await parseResume(req.files['resume'][0].path);
    }

    const result = await pool.query(
      `INSERT INTO applications 
      (name, email, phone, linkedin, technology, primary_skill, secondary_skill, location, experience_years, job_types, resume_url, id_proof_url, source, parsed_data, referral_source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id`,
      [name, email, phone || '', linkedin || '', technology || '', primary_skill || '', secondary_skill || '', location || '', sanitizedExperienceYears, job_types || '', resumeUrl, idProofUrl, 'html_form', parsedData ? JSON.stringify(parsedData) : null, referral_source || 'Direct']
    );

    res.status(201).json({ 
      message: 'Application submitted successfully',
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Recruiter: Upload resumes (bulk)
router.post('/upload-bulk', auth, isRecruiterOrAdmin, upload.array('resumes', 200), async (req, res) => {
  try {
    const uploadedResumes = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // Get resume URL - handle both Cloudinary and local storage
        let resumeUrl;
        if (file.path && file.path.startsWith('http')) {
          // Cloudinary URL (full URL in file.path)
          resumeUrl = file.path;
        } else if (file.url) {
          // Cloudinary URL (sometimes in file.url)
          resumeUrl = file.url;
        } else {
          // Local storage URL
          resumeUrl = `/uploads/${file.filename}`;
        }
        
        console.log(`📤 Uploading: ${file.originalname} → ${resumeUrl}`);
        
        // Try to parse resume (non-blocking)
        let parsedData = null;
        try {
          // For Cloudinary, use the URL; for local, use the file path
          const parseSource = resumeUrl.startsWith('http') ? resumeUrl : file.path;
          console.log(`🔍 Parsing from: ${parseSource}`);
          parsedData = await parseResume(parseSource);
          console.log(`✅ Parsed: ${file.originalname}`);
        } catch (parseError) {
          console.log(`⚠️ Could not parse ${file.originalname}: ${parseError.message}`);
          console.log(`⚠️ Saving with minimal data...`);
          // Continue anyway - file is uploaded, just not parsed
        }

        // Save to database even if parsing failed
        const result = await pool.query(
          `INSERT INTO applications 
          (name, email, phone, location, experience_years, resume_url, source, uploaded_by, parsed_data, primary_skill, technology)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id`,
          [
            parsedData?.name || file.originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),  // Clean filename as name
            parsedData?.email || '',
            parsedData?.phone || '',
            parsedData?.location || '',
            parsedData?.experience_years || 0,
            resumeUrl,
            'dashboard',
            req.user.id,
            parsedData,
            parsedData?.skills?.[0] || '',
            ''
          ]
        );
        
        uploadedResumes.push({ 
          id: result.rows[0].id, 
          filename: file.originalname,
          parsed: !!parsedData,
          url: resumeUrl
        });
        
        console.log(`✅ Saved to database: ${file.originalname} (ID: ${result.rows[0].id})`);
        
      } catch (error) {
        console.error(`❌ Error uploading ${file.originalname}:`, error);
        errors.push({ filename: file.originalname, error: error.message });
      }
    }

    res.json({ 
      message: 'Upload complete',
      uploaded: uploadedResumes.length,
      uploadedResumes,
      errors 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload resumes' });
  }
});

// Recruiter: Get own uploaded resumes (dashboard uploads only, not HTML form)
router.get('/my-resumes', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, linkedin, technology, primary_skill, secondary_skill, experience_years, location, job_types, resume_url, id_proof_url, created_at, parsed_data, recruitment_status, placement_status, referral_source
      FROM applications 
      WHERE uploaded_by = $1 AND source = 'dashboard'
      ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Recruiter: Get social media/HTML form submissions
router.get('/social-media-resumes', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, linkedin, technology, primary_skill, secondary_skill, experience_years, location, job_types, resume_url, id_proof_url, created_at, parsed_data, recruitment_status, placement_status, referral_source, source
      FROM applications 
      WHERE source = 'html_form'
      ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch social media resumes' });
  }
});

// JD Matching for Social Media Resumes
router.post('/jd-match-social', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const { matchCandidateToJD } = require('../utils/jd-matcher');

    // Get social media resumes only
    const resumes = await pool.query(
      `SELECT * FROM applications WHERE source = 'html_form' ORDER BY created_at DESC`
    );

    // Use advanced matching algorithm
    const matches = resumes.rows.map(resume => {
      const matchResult = matchCandidateToJD(resume, jobDescription);
      return {
        ...resume,
        ...matchResult
      };
    });

    // Sort by match percentage and filter > 0
    const sortedMatches = matches
      .filter(m => m.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({ matches: sortedMatches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'JD matching failed' });
  }
});

// Recruiter: Search own resumes
router.get('/my-resumes/search', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const { skill, experience_min, experience_max } = req.query;
    
    let query = 'SELECT * FROM applications WHERE uploaded_by = $1';
    const params = [req.user.id];
    let paramCount = 1;

    if (skill) {
      paramCount++;
      query += ` AND (primary_skill ILIKE $${paramCount} OR secondary_skill ILIKE $${paramCount} OR parsed_data::text ILIKE $${paramCount})`;
      params.push(`%${skill}%`);
    }

    if (experience_min) {
      paramCount++;
      query += ` AND experience_years >= $${paramCount}`;
      params.push(experience_min);
    }

    if (experience_max) {
      paramCount++;
      query += ` AND experience_years <= $${paramCount}`;
      params.push(experience_max);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Parse resume and return data (without saving)
router.post('/parse-resume', auth, isRecruiterOrAdmin, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    console.log('📄 Parsing resume for preview:', req.file.filename);
    
    // Parse the resume
    const parsedData = await parseResume(req.file.path);
    
    if (!parsedData) {
      return res.status(400).json({ error: 'Failed to parse resume' });
    }

    console.log('✅ Resume parsed successfully:', parsedData.name);
    
    // Return parsed data for form auto-fill
    res.json({
      success: true,
      data: {
        name: parsedData.name || '',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        linkedin: parsedData.linkedin || '',
        location: parsedData.location || '',
        experience_years: parsedData.experience_years || 0,
        primary_skill: parsedData.skills?.[0] || '',
        secondary_skill: parsedData.skills?.[1] || '',
        skills: parsedData.skills || [],
        education: parsedData.education || [],
        summary: parsedData.summary || '',
        tier: parsedData.tier || 'unknown',
        confidence: parsedData.confidence || 'unknown'
      },
      filename: req.file.filename,
      filePath: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('❌ Parse resume error:', error.message);
    res.status(500).json({ error: 'Failed to parse resume: ' + error.message });
  }
});

// Check if profile exists
router.post('/check-profile', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const result = await pool.query(
      `SELECT id, name, email, phone, linkedin, technology, primary_skill, secondary_skill, experience_years, location, job_types
       FROM applications 
       WHERE uploaded_by = $1 AND (email = $2 OR phone = $3)
       ORDER BY created_at DESC 
       LIMIT 1`,
      [req.user.id, email, phone]
    );

    if (result.rows.length > 0) {
      res.json({
        exists: true,
        profile: result.rows[0],
        message: 'Profile found'
      });
    } else {
      res.json({
        exists: false,
        message: 'No profile found'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Check failed' });
  }
});

// Manual entry
router.post('/manual-entry', auth, isRecruiterOrAdmin, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'id_proof', maxCount: 1 },
  { name: 'edited_resume', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, phone, linkedin, technology, primary_skill, secondary_skill, location, experience_years, job_types, action, existing_id } = req.body;
    
    // Validate and sanitize numeric fields
    const sanitizedExperienceYears = experience_years && experience_years !== '' ? parseFloat(experience_years) : 0;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const resumeUrl = req.files['resume'] ? `/uploads/${req.files['resume'][0].filename}` : null;
    const idProofUrl = req.files['id_proof'] ? `/uploads/${req.files['id_proof'][0].filename}` : null;
    const editedResumeUrl = req.files['edited_resume'] ? `/uploads/${req.files['edited_resume'][0].filename}` : null;

    // Parse resume if uploaded
    let parsedData = null;
    if (req.files['resume']) {
      parsedData = await parseResume(req.files['resume'][0].path);
    }

    if (action === 'update' && existing_id) {
      // Update existing profile
      console.log('📝 Updating profile:', existing_id, 'by user:', req.user.id);
      
      // If no new resume uploaded, create parsed_data from manual entries
      if (!parsedData) {
        parsedData = {
          name: name,
          email: email,
          phone: phone || '',
          skills: primary_skill ? [primary_skill, ...(secondary_skill ? [secondary_skill] : [])] : [],
          experience_years: sanitizedExperienceYears,
          location: location || '',
          tier: 'manual',
          confidence: 'high'
        };
      }
      
      const result = await pool.query(
        `UPDATE applications 
         SET name = $1, email = $2, phone = $3, linkedin = $4, technology = $5, 
             primary_skill = $6, secondary_skill = $7, location = $8, experience_years = $9,
             job_types = $10,
             resume_url = COALESCE($11, resume_url), id_proof_url = COALESCE($12, id_proof_url),
             edited_resume_url = COALESCE($13, edited_resume_url),
             parsed_data = $14
         WHERE id = $15 AND uploaded_by = $16
         RETURNING id`,
        [name, email, phone || '', linkedin || '', technology || '', primary_skill || '', secondary_skill || '', location || '', sanitizedExperienceYears, 
         job_types || '', resumeUrl, idProofUrl, editedResumeUrl, JSON.stringify(parsedData), existing_id, req.user.id]
      );
      
      if (result.rows.length === 0) {
        console.error('❌ Update failed: Profile not found or not owned by user');
        return res.status(404).json({ error: 'Profile not found or you do not have permission to update it' });
      }
      
      console.log('✅ Profile updated successfully:', result.rows[0].id);
      res.json({ message: 'Profile updated successfully', id: result.rows[0].id });
    } else if (action === 'continue' && existing_id) {
      // Just return success, don't create new
      res.json({ message: 'Continuing with existing profile', id: existing_id });
    } else {
      // Create new profile
      console.log('➕ Creating new profile for user:', req.user.id);
      const result = await pool.query(
        `INSERT INTO applications 
        (name, email, phone, linkedin, technology, primary_skill, secondary_skill, location, experience_years, 
         job_types, resume_url, id_proof_url, edited_resume_url, source, uploaded_by, parsed_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id`,
        [name, email, phone || '', linkedin || '', technology || '', primary_skill || '', secondary_skill || '', location || '', sanitizedExperienceYears,
         job_types || '', resumeUrl, idProofUrl, editedResumeUrl, 'dashboard', req.user.id, parsedData ? JSON.stringify(parsedData) : null]
      );
      console.log('✅ Profile created successfully:', result.rows[0].id);
      res.json({ message: 'Profile created successfully', id: result.rows[0].id });
    }
  } catch (error) {
    console.error('❌ Manual entry error:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ error: error.message || 'Failed to save profile' });
  }
});

// Update recruitment status (Recruiter can update their own resumes)
router.patch('/resumes/:id/status', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusType = 'recruitment' } = req.body;

    const validRecruitmentStatuses = ['Pending', 'On Hold', 'Profile Not Found', 'Rejected', 'Submitted', 'Interview scheduled', 'Closed'];
    const validPlacementStatuses = ['Bench', 'Onboarded', ''];
    
    if (statusType === 'placement') {
      if (!validPlacementStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid placement status' });
      }
    } else {
      if (!validRecruitmentStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid recruitment status' });
      }
    }

    // Verify the resume belongs to this recruiter (or is admin)
    const checkResult = await pool.query(
      'SELECT id FROM applications WHERE id = $1 AND uploaded_by = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0 && req.user.role !== 'admin') {
      return res.status(404).json({ error: 'Resume not found or you do not have permission' });
    }

    let result;
    if (statusType === 'placement') {
      result = await pool.query(
        'UPDATE applications SET placement_status = $1 WHERE id = $2 RETURNING id, recruitment_status, placement_status',
        [status || null, id]
      );
    } else {
      result = await pool.query(
        'UPDATE applications SET recruitment_status = $1 WHERE id = $2 RETURNING id, recruitment_status, placement_status',
        [status, id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    console.log(`✅ ${statusType === 'placement' ? 'Placement' : 'Recruitment'} status updated: Resume ${id} → ${status} by user ${req.user.id}`);

    res.json({ 
      message: 'Status updated successfully',
      resume: result.rows[0]
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete resume
router.delete('/delete/:id', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const resumeId = req.params.id;

    // First, verify the resume belongs to this recruiter
    const checkResult = await pool.query(
      'SELECT id, name, resume_url, id_proof_url FROM applications WHERE id = $1 AND uploaded_by = $2',
      [resumeId, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found or you do not have permission to delete it' });
    }

    const resume = checkResult.rows[0];

    // Delete from database
    await pool.query('DELETE FROM applications WHERE id = $1', [resumeId]);

    // Optionally delete files from disk (uncomment if you want to delete files too)
    // const fs = require('fs');
    // if (resume.resume_url) {
    //   const resumePath = '.' + resume.resume_url;
    //   if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
    // }
    // if (resume.id_proof_url) {
    //   const idProofPath = '.' + resume.id_proof_url;
    //   if (fs.existsSync(idProofPath)) fs.unlinkSync(idProofPath);
    // }

    res.json({ 
      message: 'Resume deleted successfully',
      deletedName: resume.name 
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Bulk delete resumes
router.post('/bulk-delete', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const { resumeIds } = req.body;

    if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length === 0) {
      return res.status(400).json({ error: 'No resume IDs provided' });
    }

    // Verify all resumes belong to this recruiter (or user is admin)
    const checkResult = await pool.query(
      'SELECT id FROM applications WHERE id = ANY($1) AND (uploaded_by = $2 OR source = $3)',
      [resumeIds, req.user.id, 'html_form']
    );

    if (checkResult.rows.length !== resumeIds.length) {
      return res.status(403).json({ error: 'Some resumes do not belong to you or do not exist' });
    }

    // Delete from database
    const deleteResult = await pool.query(
      'DELETE FROM applications WHERE id = ANY($1) RETURNING id',
      [resumeIds]
    );

    res.json({ 
      message: `Successfully deleted ${deleteResult.rows.length} resume(s)`,
      deletedCount: deleteResult.rows.length
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to delete resumes' });
  }
});

module.exports = router;
