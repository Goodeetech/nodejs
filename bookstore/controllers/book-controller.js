const Book = require("../models/book");

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No books found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Books retrieved successfully",
        data: books,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve books",
      error: error.message,
    });
  }
};

const getBookById = async (req, res) => {};

const addNewBook = async (req, res) => {
  try {
    const newBookForm = req.body;
    const newBook = await Book.create(newBookForm);

    if (newBookForm) {
      res.status(201).json({
        success: true,
        message: "Book added successfully",
        data: newBook,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add book",
      error: error.message,
    });
  }
};

const updateBook = async (req, res) => {};

const deleteBook = async (req, res) => {};

module.exports = {
  getAllBooks,
  getBookById,
  addNewBook,
  updateBook,
  deleteBook,
};
