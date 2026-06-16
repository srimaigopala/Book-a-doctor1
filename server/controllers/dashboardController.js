const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalDoctors = await Doctor.countDocuments();

    const totalAppointments = await Appointment.countDocuments();

    const approvedAppointments = await Appointment.countDocuments({
      status: "Approved",
    });

    const pendingAppointments = await Appointment.countDocuments({
      status: "Pending",
    });

    const cancelledAppointments = await Appointment.countDocuments({
      status: "Cancelled",
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDoctors,
        totalAppointments,
        approvedAppointments,
        pendingAppointments,
        cancelledAppointments,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getDashboardStats,
};