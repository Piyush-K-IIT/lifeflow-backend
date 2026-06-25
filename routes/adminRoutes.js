import express from "express";

import {
  getDashboardStats,
  getAllUsers
} from "../controllers/adminController.js";

const router = express.Router();

// ======================================================
// ADMIN DASHBOARD
// ======================================================

router.get(
  "/dashboard",
  getDashboardStats
);

// ======================================================
// USER MANAGEMENT
// ======================================================

router.get(
  "/users",
  getAllUsers
);

export default router;