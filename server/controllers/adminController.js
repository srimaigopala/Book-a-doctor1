const User = require("../models/User");
const Doctor = require("../models/Doctor");
const AuditLog = require("../models/AuditLog");

// Get Pending Doctors
const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ status: "pending" }).populate("userId", "name email");

    res.status(200).json({
      success: true,
      count: pendingDoctors.length,
      doctors: pendingDoctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Approve Doctor
const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor Not Found" });
    }

    doctor.status = "approved";
    await doctor.save();

    // The user already has role 'doctor' from registration, but just in case:
    await User.findByIdAndUpdate(doctor.userId, { role: "doctor" });

    await AuditLog.create({
      action: "DOCTOR_APPROVED",
      user: req.user.id,
      details: `Admin approved doctor application for ${doctor.name}.`,
    });

    res.status(200).json({
      success: true,
      message: "Doctor Approved Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Reject Doctor
const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor Not Found" });
    }

    doctor.status = "rejected";
    await doctor.save();

    // Revert user role back to patient
    await User.findByIdAndUpdate(doctor.userId, { role: "patient" });

    await AuditLog.create({
      action: "DOCTOR_REJECTED",
      user: req.user.id,
      details: `Admin rejected doctor application for ${doctor.name}.`,
    });

    res.status(200).json({
      success: true,
      message: "Doctor Rejected Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Audit Logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate("user", "name email role").sort({ createdAt: -1 }).limit(50);

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getAuditLogs,
};
