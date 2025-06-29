const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    max: [100, "Title must not exceed 100 characters"],
    trim: true,
    required: [true, "Book title is required"],
  },
  author: {
    type: String,
    trim: true,
    required: [true, "Author's name is required"],
  },
  year: {
    type: Number,
    required: [true, "Publication year is required"],
    min: [1000, "Year must be at least 1000"],
    max: [new Date().getFullYear(), "Year cannot be in the future"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Book", bookSchema);
