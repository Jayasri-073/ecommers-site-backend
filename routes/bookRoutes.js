const express = require("express");
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  addReview,
  upload
} = require("../controllers/bookController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.route("/")
  .get(getBooks)
  .post(auth, admin, upload.single("image"), createBook);

router.route("/:id")
  .get(getBookById)
  .put(auth, admin, upload.single("image"), updateBook)
  .delete(auth, admin, deleteBook);

router.route("/:id/reviews")
  .post(auth, addReview);

module.exports = router;

