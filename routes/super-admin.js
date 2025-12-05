const express = require('express');
const pool = require('../config/db');
const { authenticateToken, isSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require super admin authentication
router.use(authenticateToken, isSuperAdmin);

// Get all resumes uploaded by recruiters (dashboard source)
router.get('/recruiter-resumes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        u.name as uploader_name,
        u.email as uploader_email
      FROM applications a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.source = 'dashboard'
      AND (a.placement_status IS NULL OR a.placement_status != 'Onboarded')
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recruiter resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Get all social media resumes (html_form source)
router.get('/social-media-resumes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        u.name as uploader_name,
        u.email as uploader_email
      FROM applications a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.source = 'html_form'
      AND (a.placement_status IS NULL OR a.placement_status != 'Onboarded')
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching social media resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Get all onboarded resumes
router.get('/onboarded-resumes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        u.name as uploader_name,
        u.email as uploader_email
      FROM applications a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.placement_status = 'Onboarded'
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching onboarded resumes:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// JD Matching - search across all resumes
router.post('/jd-match', async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const { matchCandidateToJD } = require('../utils/jd-matcher');

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    // Get all resumes
    const result = await pool.query(`
      SELECT 
        a.*,
        u.name as uploader_name
      FROM applications a
      LEFT JOIN users u ON a.uploaded_by = u.id
      ORDER BY a.created_at DESC
    `);

    // Use advanced matching algorithm
    const matches = result.rows.map(resume => {
      const matchResult = matchCandidateToJD(resume, jobDescription);
      return {
        ...resume,
        ...matchResult
      };
    });

    // Filter and sort by match percentage
    const filteredMatches = matches
      .filter(m => m.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({ matches: filteredMatches });
  } catch (error) {
    console.error('Error in JD matching:', error);
    res.status(500).json({ error: 'Failed to match candidates' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['super_admin', 'admin', 'recruiter'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, hashedPassword, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    if (!['super_admin', 'admin', 'recruiter'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if email is taken by another user
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use by another user' });
    }

    let query, params;
    if (password) {
      // Update with new password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET name = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING id, name, email, role, created_at';
      params = [name, email, hashedPassword, role, id];
    } else {
      // Update without changing password
      query = 'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, name, email, role, created_at';
      params = [name, email, role, id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
