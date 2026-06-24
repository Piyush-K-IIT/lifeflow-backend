// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// SIGNUP ROUTE
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, bloodGroup, phone, city, coords } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name, email, password: hashedPassword, bloodGroup, phone, city,
            location: { type: "Point", coordinates: coords } // [lng, lat]
        });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user: newUser, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User doesn't exist" });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

module.exports = router;