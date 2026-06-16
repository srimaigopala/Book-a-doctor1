const express = require("express");
const { protect, requireRole } = require("../middleware/authMiddleware");

const {
  getDashboardStats,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/stats", protect, requireRole("admin"), getDashboardStats);

module.exports = router;
