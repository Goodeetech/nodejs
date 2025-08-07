const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    logger.info(`Connected to the database successfully`);
  } catch (error) {
    console.log("Error connecting to the database");
    logger.error(`Error occurred while connecting to the database: ${error}`);
    process.exit(1);
  }
};

module.exports = connectDB;
