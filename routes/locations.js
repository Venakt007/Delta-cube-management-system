const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Get all locations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT TRIM(location) as name 
       FROM applications 
       WHERE location IS NOT NULL AND location != '' 
       ORDER BY location ASC`
    );
    
    const locations = result.rows.map(row => row.name);
    res.json(locations);
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Add new location (just returns success - locations are auto-added when used)
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Location name is required' });
    }
    
    // We don't need to insert into a separate table
    // Locations are automatically added when candidates use them
    res.json({ message: 'Location will be added when used', name: name.trim() });
  } catch (error) {
    console.error('Failed to add location:', error);
    res.status(500).json({ error: 'Failed to add location' });
  }
});

module.exports = router;
