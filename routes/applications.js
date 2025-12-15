const express = require('express');
const pool = require('../config/db');

// Try to use Cloudinary if credentials are available, otherwise use local storage
let upload;
try {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    console.log('✅ Using Cloudinary for file uploads');
    upload = require('../middleware/upload-cloudinary');
  } else {
    console.log('⚠️  Cloudinary credentials not found, using local storage');
    upload = require('../middleware/upload');
  }
} catch (error) {
  console.error('❌ Error loading upload middleware:', error.message);
  console.log('⚠️  Falling back to local storage');
  upload = require('../middleware/upload');
}

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
    
    // Validate primary skill is mandatory
    if (!primary_skill || primary_skill.trim() === '') {
      return res.status(400).json({ error: 'Primary skill is required. Please enter at least one skill.' });
    }
    
    // Get file URLs - handle both Cloudinary and local storage
    let resumeUrl = null;
    if (req.files['resume']) {
      const file = req.files['resume'][0];
      resumeUrl = file.secure_url || file.url || (file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`);
    }
    
    let idProofUrl = null;
    if (req.files['id_proof']) {
      const file = req.files['id_proof'][0];
      idProofUrl = file.secure_url || file.url || (file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`);
    }

    // Parse resume
    let parsedData = null;
    if (req.files['resume']) {
      parsedData = await parseResume(req.files['resume'][0].path);
    }
    
    // Add new skills to keyword database for future parsing
    const { addSkillKeyword } = require('../utils/resumeParser');
    if (primary_skill) {
      primary_skill.split(',').forEach(skill => addSkillKeyword(skill.trim()));
    }
    if (secondary_skill) {
      secondary_skill.split(',').forEach(skill => addSkillKeyword(skill.trim()));
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
router.post('/upload-bulk', auth, isRecruiterOrAdmin, (req, res, next) => {
  upload.array('resumes', 200)(req, res, (err) => {
    if (err) {
      console.error('❌ Multer/Cloudinary upload error:', err.message);
      return res.status(500).json({ error: 'File upload failed: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log(`📤 Processing ${req.files?.length || 0} uploaded files...`);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const uploadedResumes = [];
    const errors = [];

    for (const file of req.files) {
      try {
        // Debug: Log file object to see what Cloudinary provides
        console.log('📦 File object:', {
          filename: file.filename,
          path: file.path,
          url: file.url,
          secure_url: file.secure_url,
          fieldname: file.fieldname
        });
        
        // Get resume URL - handle both Cloudinary and local storage
        let resumeUrl;
        
        // Cloudinary provides the URL in different properties depending on version
        if (file.secure_url) {
          // Cloudinary secure URL (HTTPS)
          resumeUrl = file.secure_url;
        } else if (file.url) {
          // Cloudinary URL
          resumeUrl = file.url;
        } else if (file.path && file.path.startsWith('http')) {
          // Cloudinary URL in path
          resumeUrl = file.path;
        } else if (file.filename) {
          // Local storage URL
          resumeUrl = `/uploads/${file.filename}`;
        } else {
          throw new Error('Could not determine file URL');
        }
        
        console.log(`📤 Uploading: ${file.originalname} → ${resumeUrl}`);
        
        // Try to parse resume with timeout protection
        let parsedData = null;
        try {
          console.log(`🔍 Attempting to parse: ${file.originalname}`);
          console.log(`   File URL: ${resumeUrl}`);
          console.log(`   File path: ${file.path}`);
          
          // For Cloudinary URLs, use the URL directly
          // For local files, use the file path
          const parseTarget = resumeUrl.startsWith('http') ? resumeUrl : file.path;
          console.log(`   Parsing from: ${parseTarget}`);
          
          // Set a timeout for parsing (30 seconds max)
          const parsePromise = parseResume(parseTarget);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Parsing timeout')), 30000)
          );
          
          parsedData = await Promise.race([parsePromise, timeoutPromise]);
          
          if (parsedData) {
            console.log(`✅ Successfully parsed: ${file.originalname}`);
            console.log(`   Name: ${parsedData.name}, Email: ${parsedData.email}, Phone: ${parsedData.phone}`);
            console.log(`   Skills: ${parsedData.skills?.slice(0, 3).join(', ')}...`);
          } else {
            console.log(`⚠️ Parser returned null for ${file.originalname}`);
          }
        } catch (parseError) {
          console.log(`⚠️ Parsing failed for ${file.originalname}: ${parseError.message}`);
          console.log(`   Error stack: ${parseError.stack}`);
          console.log(`⚠️ Continuing with filename as name...`);
          // Continue anyway - file is uploaded, just not parsed
        }

        // Save to database (with or without parsed data)
        // Create better fallback data if parsing failed
        const cleanName = file.originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const finalName = parsedData?.name && parsedData.name !== 'Unknown' ? parsedData.name : cleanName;
        const finalSkills = parsedData?.skills && parsedData.skills.length > 0 ? parsedData.skills : [];
        
        console.log(`💾 Saving to database:`);
        console.log(`   Name: ${finalName}`);
        console.log(`   Email: ${parsedData?.email || '(none)'}`);
        console.log(`   Phone: ${parsedData?.phone || '(none)'}`);
        console.log(`   Skills: ${finalSkills.slice(0, 3).join(', ') || '(none)'}`);
        
        const result = await pool.query(
          `INSERT INTO applications 
          (name, email, phone, location, experience_years, resume_url, source, uploaded_by, parsed_data, primary_skill, technology)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id`,
          [
            finalName,
            parsedData?.email || '',
            parsedData?.phone || '',
            parsedData?.location || '',
            parsedData?.experience_years || 0,
            resumeUrl,
            'dashboard',
            req.user.id,
            parsedData ? JSON.stringify(parsedData) : null,
            finalSkills[0] || '',
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
    const { sort_by, sort_order } = req.query;
    
    let orderClause = 'ORDER BY a.created_at DESC';
    if (sort_by === 'experience') {
      const order = sort_order === 'asc' ? 'ASC' : 'DESC';
      orderClause = `ORDER BY a.experience_years ${order}, a.created_at DESC`;
    }
    
    const result = await pool.query(
      `SELECT a.id, a.name, a.email, a.phone, a.linkedin, a.technology, a.primary_skill, a.secondary_skill, 
              a.experience_years, a.location, a.job_types, a.resume_url, a.id_proof_url, a.created_at, 
              a.parsed_data, a.recruitment_status, a.placement_status, a.referral_source, 
              a.assigned_to, a.assigned_at,
              u.name as assigned_to_name, u.email as assigned_to_email
      FROM applications a
      LEFT JOIN users u ON a.assigned_to = u.id
      WHERE a.uploaded_by = $1 AND a.source = 'dashboard'
      ${orderClause}`,
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
    const { sort_by, sort_order } = req.query;
    
    let orderClause = 'ORDER BY created_at DESC';
    if (sort_by === 'experience') {
      const order = sort_order === 'asc' ? 'ASC' : 'DESC';
      orderClause = `ORDER BY experience_years ${order}, created_at DESC`;
    }
    
    const result = await pool.query(
      `SELECT id, name, email, phone, linkedin, technology, primary_skill, secondary_skill, experience_years, location, job_types, resume_url, id_proof_url, created_at, parsed_data, recruitment_status, placement_status, referral_source, source
      FROM applications 
      WHERE source = 'html_form'
      ${orderClause}`
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
    
    if (!jobDescription || jobDescription.trim() === '') {
      return res.status(400).json({ error: 'Job description is required' });
    }
    
    console.log('🔍 JD Matching (Social) - Starting...');
    console.log('   JD Length:', jobDescription.length, 'characters');
    
    const { matchCandidateToJD } = require('../utils/jd-matcher');

    // Get social media resumes only
    const resumes = await pool.query(
      `SELECT * FROM applications WHERE source = 'html_form' ORDER BY created_at DESC`
    );
    
    console.log('   Found', resumes.rows.length, 'social media resumes');

    // Use advanced matching algorithm
    const matches = resumes.rows.map(resume => {
      try {
        const matchResult = matchCandidateToJD(resume, jobDescription);
        return {
          ...resume,
          ...matchResult
        };
      } catch (matchError) {
        console.error(`   ❌ Error matching resume ${resume.id}:`, matchError.message);
        return {
          ...resume,
          matchPercentage: 0,
          error: matchError.message
        };
      }
    });

    // Sort by match percentage and filter > 0
    const sortedMatches = matches
      .filter(m => m.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    console.log('   ✅ Matches found:', sortedMatches.length);

    res.json({ matches: sortedMatches });
  } catch (error) {
    console.error('❌ JD matching failed:', error);
    res.status(500).json({ error: 'JD matching failed: ' + error.message });
  }
});

// Recruiter: Search own resumes
router.get('/my-resumes/search', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const { skill, experience_min, experience_max, sort_by, sort_order } = req.query;
    
    let query = `SELECT a.*, u.name as assigned_to_name, u.email as assigned_to_email
                 FROM applications a
                 LEFT JOIN users u ON a.assigned_to = u.id
                 WHERE a.uploaded_by = $1 AND a.source = 'dashboard'`;
    const params = [req.user.id];
    let paramCount = 1;

    if (skill) {
      paramCount++;
      // Search ONLY in primary_skill
      query += ` AND a.primary_skill ILIKE $${paramCount}`;
      params.push(`%${skill}%`);
    }

    if (experience_min) {
      paramCount++;
      query += ` AND a.experience_years >= $${paramCount}`;
      params.push(experience_min);
    }

    if (experience_max) {
      paramCount++;
      query += ` AND a.experience_years <= $${paramCount}`;
      params.push(experience_max);
    }

    // Sorting
    if (sort_by === 'experience') {
      const order = sort_order === 'asc' ? 'ASC' : 'DESC';
      query += ` ORDER BY a.experience_years ${order}, a.created_at DESC`;
    } else {
      query += ' ORDER BY a.created_at DESC';
    }

    const result = await pool.query(query, params);
    
    console.log(`🔍 Search by ${req.user.name}: skill="${skill || 'any'}", found ${result.rows.length} resumes`);
    
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
    
    // Validate primary skill is mandatory
    if (!primary_skill || primary_skill.trim() === '') {
      return res.status(400).json({ error: 'Primary skill is required. Please enter at least one skill.' });
    }
    
    // Get file URLs - handle both Cloudinary and local storage
    let resumeUrl = null;
    if (req.files['resume']) {
      const file = req.files['resume'][0];
      resumeUrl = file.secure_url || file.url || (file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`);
    }
    
    let idProofUrl = null;
    if (req.files['id_proof']) {
      const file = req.files['id_proof'][0];
      idProofUrl = file.secure_url || file.url || (file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`);
    }
    
    let editedResumeUrl = null;
    if (req.files['edited_resume']) {
      const file = req.files['edited_resume'][0];
      editedResumeUrl = file.secure_url || file.url || (file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`);
    }

    // Skip parsing to prevent timeouts
    let parsedData = null;
    
    // Always create parsed_data from manual entries to ensure skills are searchable
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
    
    // Add new skills to keyword database for future parsing
    const { addSkillKeyword } = require('../utils/resumeParser');
    if (primary_skill) {
      primary_skill.split(',').forEach(skill => addSkillKeyword(skill.trim()));
    }
    if (secondary_skill) {
      secondary_skill.split(',').forEach(skill => addSkillKeyword(skill.trim()));
    }

    if (action === 'update' && existing_id) {
      // Update existing profile
      console.log('📝 Updating profile:', existing_id, 'by user:', req.user.id);
      
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

// Update recruitment status (Recruiter can update their own resumes, Admin/Super Admin can update any)
router.patch('/resumes/:id/status', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusType = 'recruitment' } = req.body;

    console.log(`📝 Status update request: Resume ${id}, Status: ${status}, Type: ${statusType}, User: ${req.user.id} (${req.user.role})`);

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

    // Verify permissions: recruiter can update own resumes, admin/super_admin can update any
    if (req.user.role === 'recruiter') {
      const checkResult = await pool.query(
        'SELECT id FROM applications WHERE id = $1 AND uploaded_by = $2',
        [id, req.user.id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(403).json({ error: 'You can only update your own resumes' });
      }
    }

    let result;
    if (statusType === 'placement') {
      result = await pool.query(
        'UPDATE applications SET placement_status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, recruitment_status, placement_status',
        [status || null, id]
      );
    } else {
      result = await pool.query(
        'UPDATE applications SET recruitment_status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, recruitment_status, placement_status',
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
    console.error('❌ Status update error:', error);
    res.status(500).json({ error: 'Failed to update status: ' + error.message });
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

// Get list of admins for assignment
router.get('/admins-list', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role 
       FROM users 
       WHERE role IN ('admin', 'super_admin') 
       ORDER BY name ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch admins:', error);
    res.status(500).json({ error: 'Failed to fetch admins list' });
  }
});

// Assign resume to admin
router.patch('/resumes/:id/assign', auth, isRecruiterOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    console.log(`📌 Assignment request: Resume ${id} → Admin ${adminId} by User ${req.user.id}`);

    // Verify the resume belongs to this recruiter (or user is admin)
    if (req.user.role === 'recruiter') {
      const checkResult = await pool.query(
        'SELECT id FROM applications WHERE id = $1 AND uploaded_by = $2',
        [id, req.user.id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(403).json({ error: 'You can only assign your own resumes' });
      }
    }

    // Verify the admin exists
    if (adminId) {
      const adminCheck = await pool.query(
        'SELECT id, name FROM users WHERE id = $1 AND role IN ($2, $3)',
        [adminId, 'admin', 'super_admin']
      );

      if (adminCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
    }

    // Update assignment
    const result = await pool.query(
      `UPDATE applications 
       SET assigned_to = $1, assigned_at = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING id, assigned_to, assigned_at`,
      [adminId || null, adminId ? new Date() : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    console.log(`✅ Resume ${id} assigned to admin ${adminId}`);

    res.json({ 
      message: adminId ? 'Resume assigned successfully' : 'Assignment removed',
      resume: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Assignment error:', error);
    res.status(500).json({ error: 'Failed to assign resume: ' + error.message });
  }
});

module.exports = router;
