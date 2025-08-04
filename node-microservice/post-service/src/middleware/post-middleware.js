const logger = require("../utils/logger");

const authenticationRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    logger.warn("Access attempted without user Id");
    return res.status(401).json({
      message: "Authentication required! Please login to continue",
      success: false,
    });
  }

  req.user = { userId };
  next();
};

module.exports = { authenticationRequest };
