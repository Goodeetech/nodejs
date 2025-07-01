const express = require("express");
const homeMiddleware = require("../middleware/home-middleware");
const adminMiddleware = require("../middleware/admin-middleware"); // Assuming you have an admin middleware

const router = express.Router();

router.get("/welcome", homeMiddleware, adminMiddleware, (req, res) => {
  res.status(200).json({
    message: "Welcome to the admin page",
    success: true,
  });
});

module.exports = router;
