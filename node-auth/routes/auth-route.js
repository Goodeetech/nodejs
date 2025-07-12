const express = require("express");
const {
  registerUser,
  loginUser,
  changePassword,
} = require("../controllers/auth-controller");
const homeMiddleware = require("../middleware/home-middleware");

const router = express.Router();

// all routes are related to authentication and authorization

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/change-password", homeMiddleware, changePassword);

module.exports = router;
