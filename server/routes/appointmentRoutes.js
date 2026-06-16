const express = require("express");

const {
  bookAppointment,
  getAppointments,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointmentController");

const { protect, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Patient books an appointment
router.post("/book", protect, requireRole("patient"), bookAppointment);

// All appointments — admin oversight only
router.get("/all", protect, requireRole("admin"), getAppointments);

// Logged-in patient's own appointments
router.get("/me", protect, getMyAppointments);

// Logged-in doctor's appointments
router.get("/doctor", protect, requireRole("doctor"), getDoctorAppointments);

// Approve / Reject / Complete (doctor for own, or admin)
router.put(
  "/status/:id",
  protect,
  requireRole("doctor", "admin"),
  updateAppointmentStatus
);

// Cancel (owning patient or admin)
router.put("/cancel/:id", protect, cancelAppointment);

module.exports = router;
