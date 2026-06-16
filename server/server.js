const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Book A Doctor Backend Running");
});

// Auth Routes (patients, doctors and admins all authenticate here)
app.use("/api/auth", authRoutes);

// Doctor Routes
app.use("/api/doctors", doctorRoutes);

// Appointment Routes
app.use("/api/appointments", appointmentRoutes);

// Dashboard Routes
app.use("/api/dashboard", dashboardRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});