const express = require("express");
const {
  uploadBookImage,
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  addReview
} = require("../controllers/bookController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", auth, admin, uploadBookImage, createBook);
router.put("/:id", auth, admin, uploadBookImage, updateBook);
router.delete("/:id", auth, admin, deleteBook);
router.post("/:id/reviews", auth, addReview);

module.exports = router;
