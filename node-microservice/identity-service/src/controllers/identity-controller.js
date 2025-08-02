const logger = require("../utils/logger");
const { validateRegistration } = require("../utils/validation");
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");

//registration
const registerUser = async (req, res) => {
  logger.info("Registration endpoint hit");
  try {
    // validate the schema
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn(`Validation error: ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, username, password } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      logger.warn("User already exists with email or username");
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or username",
      });
    }
    user = new User({ email, username, password });
    await user.save();
    logger.info("User registered successfully", user._id);

    const { accessToken, refreshToken } = await generateToken(user);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Error during registration:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//login

//refresh token

//logout

module.exports = { registerUser };
