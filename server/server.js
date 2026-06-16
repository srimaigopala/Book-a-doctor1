const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const doctorAuthRoutes = require("./routes/doctorAuthRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Book A Doctor Backend Running");
});

// Patient Auth Routes
app.use("/api/auth", authRoutes);

// Doctor Auth Routes
app.use("/api/doctor-auth", doctorAuthRoutes);

// Doctor Routes
app.use("/api/doctors", doctorRoutes);

// Appointment Routes
app.use("/api/appointments", appointmentRoutes);

// Dashboard Routes
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});