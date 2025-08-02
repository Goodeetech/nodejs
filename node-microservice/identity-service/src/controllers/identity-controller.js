const logger = require("../utils/logger");
const { validateRegistration, validateLogin } = require("../utils/validation");
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");
const { valid } = require("joi");
const RefreshToken = require("../models/refreshToken");
const { trusted } = require("mongoose");

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

const loginUser = async (req, res) => {
  logger.info("Logging in user from the identity service");
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn(`Validation error ${error.details[0].message}`);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`User doesn't exist`);
      return res.status(400).json({
        success: false,
        message: "User does not exist, please check your details",
      });
    }
    //check valid password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      logger.warn(`Invalid credentials`);
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    const { accessToken, refreshToken } = await generateToken(user);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      userId: user._id,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.warn(`Server error login in user`, error);
    return res.status(500).json({
      message: "Internal server Error",
      success: false,
    });
  }
};

//refresh token

const refreshUserToken = async (req, res) => {
  logger.warn(`Getting the refreshToken for authentication`);
  try {
    const { refreshTokenOne } = req.body;
    if (!refreshTokenOne) {
      logger.warn(`Refresh token is missing`);
      return res.status(400).json({
        message: "Refresh Token is missing",
        success: false,
      });
    }

    const userRefreshToken = await RefreshToken.findOne({
      token: refreshTokenOne,
    });

    if (
      !userRefreshToken ||
      new Date(userRefreshToken.expiresAt) < new Date()
    ) {
      logger.warn(`Invalid refresh Token`);
      return res.status(400).json({
        message: "Invalid refresh Token",
        success: false,
      });
    }

    const user = await User.findById(userRefreshToken.user);

    if (!user) {
      logger.warn("User not found");
      return res.status(400).json({
        message: "User not found",
        success: fase,
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    //delete the existing refresh token
    await RefreshToken.deleteOne({ _id: userRefreshToken._id });

    return res.status(200).json({
      message: "User refresh Token valid",
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.warn(`Server error login in user`, error);
    return res.status(500).json({
      message: "Internal server Error",
      success: false,
    });
  }
};

//logout

const logoutUser = async (req, res) => {
  logger.warn(`Hit the logout api`);
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn(`Refresh token is missing`);
      return res.status(400).json({
        message: "Refresh Token is missing",
        success: false,
      });
    }
    const existingToken = await RefreshToken.findOne({ token: refreshToken });

    if (!existingToken) {
      logger.warn("Invalid or already deleted refresh token");
      return res.status(400).json({
        message: "Invalid or already deleted refresh token",
        success: false,
      });
    }

    await RefreshToken.deleteOne({ _id: existingToken._id });

    logger.info("Refresh token delted successfully");
    return res.status(200).json({
      message: "User logout successfully",
      success: true,
    });
  } catch (error) {
    logger.warn(`Server error login in user`, error);
    return res.status(500).json({
      message: "Internal server Error",
      success: false,
    });
  }
};

module.exports = { registerUser, loginUser, refreshUserToken, logoutUser };
