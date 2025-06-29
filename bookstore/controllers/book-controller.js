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

const getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Book retrieved successfully",
        data: book,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve book",
      error: error.message,
    });
  }
};

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

const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const updatedBookForm = req.body;
    const updatedBook = await Book.findByIdAndUpdate(bookId, updatedBookForm, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found, please check your ID",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Book updated successfully",
        data: updatedBook,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update book",
      error: error.message,
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deleteBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found, please check your ID",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Book deleted successfully",
        data: deletedBook,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: error.message,
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  addNewBook,
  updateBook,
  deleteBook,
};
