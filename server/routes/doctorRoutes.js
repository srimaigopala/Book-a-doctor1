const express = require("express");
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getDoctors,
  getAllDoctorsAdmin,
  getSingleDoctor,
  updateDoctor,
  deleteDoctor,
  submitOnboarding,
  getDoctorProfile,
} = require("../controllers/doctorController");

const router = express.Router();

// Logged-in doctor's own profile
router.get("/me", protect, getDoctorProfile);

// Doctor submits onboarding details for approval
router.post("/onboarding", protect, requireRole("doctor"), submitOnboarding);

// Admin: all doctors (any status)
router.get("/admin/all", protect, requireRole("admin"), getAllDoctorsAdmin);

// Approved doctors — public directory (used by the landing page too)
router.get("/all", getDoctors);

// Single doctor (public profile of an approved doctor)
router.get("/:id", getSingleDoctor);

// Admin-only management
router.put("/:id", protect, requireRole("admin"), updateDoctor);
router.delete("/:id", protect, requireRole("admin"), deleteDoctor);

module.exports = router;
