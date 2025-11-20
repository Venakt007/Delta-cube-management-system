const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Get all technologies
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT name FROM technologies ORDER BY name ASC'
    );
    const technologies = result.rows.map(row => row.name);
    res.json(technologies);
  } catch (error) {
    console.error('Error fetching technologies:', error);
    res.status(500).json({ error: 'Failed to fetch technologies' });
  }
});

// Add new technology
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Technology name is required' });
    }

    // Check if technology already exists
    const existing = await pool.query(
      'SELECT id FROM technologies WHERE LOWER(name) = LOWER($1)',
      [name.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Technology already exists' });
    }

    // Insert new technology
    await pool.query(
      'INSERT INTO technologies (name) VALUES ($1)',
      [name.trim()]
    );

    res.json({ success: true, message: 'Technology added successfully' });
  } catch (error) {
    console.error('Error adding technology:', error);
    res.status(500).json({ error: 'Failed to add technology' });
  }
});

// Delete technology (optional - for admin use)
router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    await pool.query(
      'DELETE FROM technologies WHERE name = $1',
      [name]
    );

    res.json({ success: true, message: 'Technology deleted successfully' });
  } catch (error) {
    console.error('Error deleting technology:', error);
    res.status(500).json({ error: 'Failed to delete technology' });
  }
});

module.exports = router;
