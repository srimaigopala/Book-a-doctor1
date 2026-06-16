const express = require("express");

const {
  addDoctor,
  getDoctors,
  getSingleDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");

const router = express.Router();

router.post("/add", addDoctor);

router.get("/all", getDoctors);

router.get("/:id", getSingleDoctor);

router.put("/:id", updateDoctor);

router.delete("/:id", deleteDoctor);

module.exports = router;