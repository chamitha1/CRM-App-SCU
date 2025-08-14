const express = require('express');
const router = express.Router();

// Assets data endpoint
router.get('/', async (req, res) => {
  try {
    // Mock assets data - replace with actual database queries
    const assets = [
      { id: 1, name: 'Asset 1', value: 10000, type: 'Type A' },
      { id: 2, name: 'Asset 2', value: 15000, type: 'Type B' },
      { id: 3, name: 'Asset 3', value: 12500, type: 'Type A' },
      { id: 4, name: 'Asset 4', value: 10500, type: 'Type C' }
    ];

    res.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ message: 'Error fetching assets' });
  }
});

module.exports = router;

