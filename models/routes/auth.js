import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// ======================================================
// SIGNUP
// ======================================================

router.post('/signup', async (req, res) => {
  try {

    let {
      name,
      email,
      password,
      phone,
      bloodGroup,
      location,
      role
    } = req.body;

    console.log("SIGNUP DATA:", {
      name,
      email,
      phone,
      bloodGroup,
      location,
      role
    });

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const userData = {
      name,
      email,
      password,
      phone,
      location,
      role: role || "donor"
    };

    // Only donors get blood group

    if (
      role === "donor" &&
      bloodGroup &&
      bloodGroup.trim() !== ""
    ) {
      userData.bloodGroup =
        bloodGroup;
    }

    console.log(
      "USER DATA TO SAVE:",
      userData
    );

    const newUser =
      new User(userData);

    await newUser.save();

    res.status(201).json({
      success: true,
      message:
        "User created successfully"
    });

  } catch (error) {

    console.error(
      "Signup Error:",
      error
    );

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

export default router;
