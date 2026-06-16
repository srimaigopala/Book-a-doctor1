const express = require("express");

const {
  registerDoctor,
  loginDoctor,
} = require("../controllers/doctorAuthController");

const router = express.Router();

// Register Doctor
router.post("/register", registerDoctor);

// Login Doctor
router.post("/login", loginDoctor);

module.exports = router;