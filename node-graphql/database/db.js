const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Error connecting to the database", e);
    process.exit(1);
  }
};

module.exports = connectDB;
