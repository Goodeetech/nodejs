const jwt = require("jsonwebtoken");
require("dotenv").config();
const homeMiddleware = (req, res, next) => {
  // Middleware logic for home route
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", authHeader);

  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
      success: false,
    });
  }

  // Here you would typically verify the token
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decodedToken);
    req.userInfo = decodedToken; // Attach user info to the request object
    next();
  } catch (error) {
    res.status(403).json({
      message: "Forbidden access, invalid token",
      success: false,
    });
  }
  // Call the next middleware or route handler
};

module.exports = homeMiddleware;
