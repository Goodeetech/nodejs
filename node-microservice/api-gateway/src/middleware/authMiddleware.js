const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("Access token not present, access denied!");
    return res.status(401).json({
      message: "Authentication denied!",
      success: false,
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.error("Invalid access token, access denied!");
      return res.status(403).json({
        message: "Invalid access token!",
        success: false,
      });
    }
    req.user = user;
    next();
  });
};

module.exports = { validateToken };
