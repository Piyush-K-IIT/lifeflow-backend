import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

const router = express.Router();


// ======================================================
// GENERATE JWT TOKEN
// ======================================================

const generateToken = (id) => {

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );

};


// ======================================================
// @route   POST /api/auth/signup
// ======================================================

router.post("/signup", async (req, res) => {

try {

const {
  name,
  email,
  password,
  bloodGroup,
  location,
  phone,
  role
} = req.body;

console.log("SIGNUP DATA:", {
  name,
  email,
  role,
  bloodGroup
});

const existingUser =
  await User.findOne({ email });

if (existingUser) {

  return res.status(400).json({
    success: false,
    message: "User already registered"
  });

}

const salt =
  await bcrypt.genSalt(10);

const hashedPassword =
  await bcrypt.hash(
    password,
    salt
  );

const userData = {

  name,
  email,
  password: hashedPassword,
  location,
  phone,

  role: role || "donor",

  lastDonated: null,
  totalDonations: 0,
  rewardPoints: 0

};

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

console.log(
  "ABOUT TO CREATE USER"
);

const newUser =
  await User.create(
    userData
  );

console.log(
  "USER CREATED SUCCESSFULLY"
);

res.status(201).json({

  success: true,

  message:
    "User registered successfully",

  token:
    generateToken(
      newUser._id
    ),

  user: {

    _id:
      newUser._id,

    name:
      newUser.name,

    email:
      newUser.email,

    bloodGroup:
      newUser.bloodGroup,

    location:
      newUser.location,

    phone:
      newUser.phone,

    role:
      newUser.role,

    totalDonations:
      newUser.totalDonations,

    rewardPoints:
      newUser.rewardPoints,

    lastDonated:
      newUser.lastDonated

  }

});


} catch (error) {

  console.error(
    "FULL SIGNUP ERROR:"
  );

  console.error(error);

  console.error(
    error.stack
  );

  res.status(500).json({

    success: false,

    message:
      error.message ||
      "Internal Server Error"

  });

}

});


// ======================================================
// @route   POST /api/auth/login
// ======================================================

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    console.log("LOGIN EMAIL:", email);

const user = await User.findOne({ email });

console.log("FOUND USER:", user);

if (!user) {

  console.log("USER NOT FOUND");

  return res.status(400).json({
    success: false,
    message: "Invalid Email or Password"
  });

}

// ======================================================
// CHECK IF USER IS BLOCKED
// ======================================================

if (user.isBlocked) {

  console.log("BLOCKED USER LOGIN ATTEMPT");

  return res.status(403).json({

    success: false,

    message:
      "Your account has been blocked by the administrator. Please contact support."

  });

}

console.log("User blocked status:", user.isBlocked);

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    console.log(
      "PASSWORD MATCH:",
      isMatch
    );

    if (!isMatch) {

      console.log(
        "PASSWORD INCORRECT"
      );

      return res.status(400).json({

        success: false,

        message:
          "Invalid Email or Password"

      });

    }

    console.log(
      "LOGIN SUCCESS"
    );

    return res.status(200).json({

      success: true,

      message:
        "Login successful",

      token:
        generateToken(
          user._id
        ),

      user: {

        _id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        phone:
          user.phone,

        bloodGroup:
          user.bloodGroup,

        location:
          user.location,

        role:
          user.role,

        totalDonations:
          user.totalDonations,

        rewardPoints:
          user.rewardPoints,

        isAvailable:
          user.isAvailable,

        emergencyAvailable:
          user.emergencyAvailable,

        lastDonated:
          user.lastDonated,

        nextEligibleDate:
          user.nextEligibleDate

      }

    });

  } catch (error) {

    console.error(
      "LOGIN ERROR:"
    );

    console.error(
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Internal Server Error"

    });

  }

});

// ======================================================
// @route   PATCH /api/auth/update-donation-status/:id
// ======================================================

router.patch(
  "/update-donation-status/:id",
  async (req, res) => {

    try {

      const { lastDonated } = req.body;


      // NEXT ELIGIBLE DATE
      const nextEligibleDate = new Date(lastDonated);

      nextEligibleDate.setDate(
        nextEligibleDate.getDate() + 90
      );


      // UPDATE USER
      const user = await User.findByIdAndUpdate(

        req.params.id,

        {

          lastDonated,

          nextEligibleDate,

          $inc: {

            totalDonations: 1,

            points: 200

          }

        },

        {
          new: true
        }

      );


      if (!user) {

        return res.status(404).json({

          success: false,

          message: "User not found"

        });

      }


      res.status(200).json({

        success: true,

        message: "Donation status updated",

        user: {

          _id: user._id,

          name: user.name,

          bloodGroup: user.bloodGroup,

          location: user.location,

          totalDonations: user.totalDonations,

          points: user.points,

          lastDonated: user.lastDonated,

          nextEligibleDate: user.nextEligibleDate

        }

      });

    } catch (error) {

      console.error(
        "Donation Update Error:",
        error
      );

      res.status(500).json({

        success: false,

        message: "Server error during update"

      });

    }

  }
);

export default router;

