import express from "express";
import User from "../models/User.js";

const router = express.Router();


// GET LEADERBOARD
router.get("/", async (req, res) => {

  try {

    const users = await User.find()
      .sort({ totalDonations: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      users
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

export default router;

