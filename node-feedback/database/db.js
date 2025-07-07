const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to the Database");
  } catch (error) {
    console.log("Error occured due to", error);
    process.exit(1);
  }
};

module.exports = connectDB;
