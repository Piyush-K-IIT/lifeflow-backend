import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// @route   GET api/donors/search
// @desc    Find donors by blood group and/or location
router.get('/search', async (req, res) => {
  try {
    const { bloodGroup, location } = req.query;

    // Build dynamic query
    let query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (location) {
      // 'i' makes it case-insensitive
      query.location = { $regex: location, $options: 'i' };
    }

    // Find users, but EXCLUDE the password field for security
    const donors = await User.find(query).select('-password');

    res.status(200).json({
      success: true,
      count: donors.length,
      donors
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Server error during search" });
  }
});

export default router;