const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      req.user = decoded;

      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Not Authorized, No Token",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      success: false,
      message: "Token Failed",
    });
  }
};

// Role-based authorization. Use after `protect`, e.g. requireRole("admin").
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you do not have permission to perform this action",
      });
    }
    next();
  };
};

module.exports = { protect, requireRole };