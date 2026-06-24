import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Search Donors
router.get('/search', async (req, res) => {
  try {
    const { bloodGroup, location } = req.query;
    let query = {};
    
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (location) query.location = { $regex: location, $options: 'i' };

    const donors = await User.find(query).select('-password');
    res.json({ success: true, count: donors.length, donors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
