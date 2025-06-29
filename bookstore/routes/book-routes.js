const express = require("express");
const {
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  addNewBook,
} = require("../controllers/book-controller");

const router = express.Router();

////all the routes related to the books

router.get("/get", getAllBooks);
router.get("/get/:id", getBookById);
router.post("/add", addNewBook);
router.put("/update/:id", updateBook);
router.delete("/delete/:id", deleteBook);

module.exports = router;
