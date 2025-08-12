const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error(`Error occured while connecting to the database : ${error}`);
    process.exit(1);
  }
};

module.exports = connectDB;
