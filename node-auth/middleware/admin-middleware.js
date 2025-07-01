const adminMiddleware = (req, res, next) => {
  if (req.userInfo.role !== "admin") {
    return res.status(403).json({
      message: "Forbidden access, you are not an admin",
      success: false,
    });
  }
  next();
};

module.exports = adminMiddleware;
