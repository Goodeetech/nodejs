// register logic
const User = require("../model/model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists with this username or email, please try another username or email",
        success: false,
      });
    }

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create a new User

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user", // default to 'user' if no role is provided
    });
    await newUser.save();

    if (!newUser) {
      return res.status(500).json({
        message: "User registration failed, please try again later",
        success: false,
      });
    } else {
      res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
          username: newUser.username,
          email: newUser.email,
          id: newUser._id,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong while registering user",
      error: error.message,
      success: false,
    });
  }
};

//Login logic

const loginUser = async (req, res) => {
  try {
    // get the user credentials from the request body
    const { username, password } = req.body;
    // check if the user exists in the database

    const user = await User.findOne({
      username,
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid username or password",
        success: false,
      });
    }

    // compare the password with the hashed password in the database

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid username or password",
        success: false,
      });
    }

    // create a JWT token

    const userAcessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION || "15m", // default to 1 hour if not set
      }
    );

    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      user: {
        username: user.username,
        email: user.email,
        id: user._id,
      },
      accessToken: userAcessToken, // send the access token to the client
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong while trying to login user",
      error: error.message,
      success: false,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const { userId } = req.userInfo;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    //check if the old password is correct
    const correctPassword = await bcrypt.compare(oldPassword, user.password);
    if (!correctPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password is not correct, Please try again",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newlyCreatedPassword = await bcrypt.hash(newPassword, salt);

    //update user password
    user.password = newlyCreatedPassword;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong while trying to login user",
      error: error.message,
      success: false,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
};
