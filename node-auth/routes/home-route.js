const express = require("express");

const router = express.Router();
const homeMiddleware = require("../middleware/home-middleware");

router.get("/welcome", homeMiddleware, (req, res) => {
  const { userId, role } = req.userInfo; // Extract user info from the request object
  res.status(200).json({
    message: "Welcome to the home page",
    success: true,
    user: {
      _id: userId,
      role: role,
    },
  });
});

module.exports = router;
