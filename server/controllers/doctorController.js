const Doctor = require("../models/Doctor");

// Get All Approved Doctors (what patients browse)
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "approved" });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get All Doctors regardless of status (admin management view)
const getAllDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Single Doctor
const getSingleDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor Not Found",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update Doctor
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor Updated Successfully",
      doctor,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete Doctor
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor Not Found",
      });
    }

    await Doctor.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Doctor Deleted Successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const submitOnboarding = async (req, res) => {
  try {
    const { specialization, experience, fees } = req.body;
    // We assume the user ID is attached to the request by the auth middleware
    const userId = req.user.id;

    let doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      doctor = new Doctor({ userId, name: req.user.name || "Doctor" });
    }

    doctor.specialization = specialization;
    doctor.experience = experience;
    doctor.fees = fees;
    doctor.status = "pending";
    await doctor.save();

    const AuditLog = require("../models/AuditLog");
    await AuditLog.create({
      action: "DOCTOR_ONBOARDING_SUBMITTED",
      user: userId,
      details: `Doctor ${doctor.name} submitted onboarding details and is pending approval.`,
    });

    res.status(200).json({
      success: true,
      message: "Onboarding submitted successfully. Waiting for admin approval.",
      doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getDoctors,
  getAllDoctorsAdmin,
  getSingleDoctor,
  updateDoctor,
  deleteDoctor,
  submitOnboarding,
  getDoctorProfile,
};