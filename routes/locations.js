const express = require('express');
const axios = require('axios');

const router = express.Router();

// Google Places API Autocomplete
router.get('/autocomplete', async (req, res) => {
  try {
    const { input } = req.query;
    
    if (!input || input.length < 2) {
      return res.json({ predictions: [] });
    }

    // Get API key from environment
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️  GOOGLE_PLACES_API_KEY not set, using fallback locations');
      return res.json({ predictions: [] });
    }

    // Call Google Places API
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      {
        params: {
          input: input,
          key: apiKey,
          types: '(cities)',
          components: 'country:in' // Restrict to India
        }
      }
    );

    console.log('Google Places API Response:', JSON.stringify(response.data, null, 2));

    // Check for API errors
    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API Error Status:', response.data.status);
      console.error('Error Message:', response.data.error_message);
      return res.json({ predictions: [], error: response.data.error_message });
    }

    // Format predictions
    const predictions = response.data.predictions.map(p => p.description);

    res.json({ predictions: predictions.slice(0, 5) });
  } catch (error) {
    console.error('Google Places API error:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    // Return empty array on error (frontend will use fallback)
    res.json({ predictions: [] });
  }
});

module.exports = router;
