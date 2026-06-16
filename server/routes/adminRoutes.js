const express = require("express");
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getAuditLogs,
} = require("../controllers/adminController");

const router = express.Router();

// Every admin route requires a valid token AND the admin role.
router.use(protect, requireRole("admin"));

router.get("/pending-doctors", getPendingDoctors);
router.put("/approve-doctor/:id", approveDoctor);
router.put("/reject-doctor/:id", rejectDoctor);
router.get("/audit-logs", getAuditLogs);

module.exports = router;
