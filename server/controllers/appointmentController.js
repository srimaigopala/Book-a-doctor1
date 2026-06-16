const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const AuditLog = require("../models/AuditLog");

// Book Appointment (patient)
const bookAppointment = async (req, res) => {
  try {
    const { doctor, appointmentDate, appointmentTime, reason } = req.body;

    // The patient is ALWAYS taken from the authenticated token, never the body.
    const user = req.user.id;

    if (!doctor || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date, time and reason for visit are all required",
      });
    }

    // Only approved doctors can be booked.
    const doctorDoc = await Doctor.findById(doctor);
    if (!doctorDoc || doctorDoc.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "This doctor is not available for booking",
      });
    }

    const appointment = await Appointment.create({
      user,
      doctor,
      appointmentDate,
      appointmentTime,
      reason,
    });

    await AuditLog.create({
      action: "APPOINTMENT_BOOKED",
      user,
      details: `Patient booked an appointment with ${doctorDoc.name} on ${appointmentDate} at ${appointmentTime}.`,
    });

    res.status(201).json({
      success: true,
      message: "Appointment Booked Successfully",
      appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get All Appointments (admin only)
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("user", "name email")
      .populate("doctor", "name specialization")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get the logged-in patient's own appointments
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .populate("doctor", "name specialization fees")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get appointments for the logged-in doctor.
// NOTE: the JWT carries the *User* id; appointments reference the *Doctor* id,
// so we must resolve the Doctor document first.
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorDoc = await Doctor.findOne({ userId: req.user.id });
    if (!doctorDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({ doctor: doctorDoc._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Appointment Status (doctor accepts/rejects their own; admin any)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["Pending", "Approved", "Rejected", "Cancelled", "Completed"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment Not Found" });
    }

    // A doctor may only act on appointments that belong to them.
    if (req.user.role === "doctor") {
      const doctorDoc = await Doctor.findOne({ userId: req.user.id });
      if (!doctorDoc || appointment.doctor.toString() !== doctorDoc._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only manage your own appointments",
        });
      }
    }

    appointment.status = status;
    await appointment.save();

    await AuditLog.create({
      action: "APPOINTMENT_STATUS_UPDATED",
      user: req.user.id,
      details: `Appointment ${id} status updated to ${status} by ${req.user.role}.`,
    });

    res.status(200).json({
      success: true,
      message: "Appointment Status Updated",
      appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Cancel Appointment (the owning patient, or an admin)
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment Not Found" });
    }

    if (
      req.user.role !== "admin" &&
      appointment.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own appointments",
      });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment Cancelled Successfully",
      appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
};
