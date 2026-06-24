import express from "express";

import User from "../models/User.js";

const router = express.Router();


// ======================================================
// GET SINGLE USER PROFILE
// ======================================================

router.get("/:id", async (req, res) => {

  try {

    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


// ======================================================
// UPDATE USER PROFILE
// ======================================================

router.put("/:id", async (req, res) => {

  try {

    const {
      name,
      location,
      phone,
      isAvailable
    } = req.body;

    const updatedUser =
      await User.findByIdAndUpdate(

        req.params.id,

        {
          name,
          location,
          phone,
          isAvailable
        },

        {
          new: true
        }

      ).select("-password");


    if (!updatedUser) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    res.status(200).json({

      success: true,

      message: "Profile updated successfully",

      user: updatedUser

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

