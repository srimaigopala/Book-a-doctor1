const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalDoctors = await Doctor.countDocuments({ status: "approved" });
    const pendingDoctors = await Doctor.countDocuments({ status: "pending" });
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

    // appointmentDate is stored as a "YYYY-MM-DD" string, so match today's prefix.
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: todayStr,
    });

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        pendingDoctors,
        totalAppointments,
        approvedAppointments,
        pendingAppointments,
        cancelledAppointments,
        todayAppointments,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getDashboardStats,
};
