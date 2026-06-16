const express = require("express");

const {
  bookAppointment,
  getAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointmentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Patient books appointment
router.post("/book", protect, bookAppointment);

// Get all appointments
router.get("/all", protect, getAppointments);

// Get appointments for logged-in doctor
router.get("/doctor", protect, getDoctorAppointments);

// Approve / Reject appointment
router.put("/status/:id", protect, updateAppointmentStatus);

// Cancel appointment
router.put("/cancel/:id", protect, cancelAppointment);

module.exports = router;