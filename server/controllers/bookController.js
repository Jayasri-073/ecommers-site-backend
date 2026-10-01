const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Book = require("../models/book");

const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed."));
  }
  cb(null, true);
};

exports.uploadBookImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
}).single("image");

const imageUrlFor = (req, file) =>
  file ? `${req.protocol}://${req.get("host")}/uploads/${file.filename}` : undefined;

exports.getBooks = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 48);
    const skip = (page - 1) * limit;
    const { search, category, sort = "newest" } = req.query;
    const normalizedSort = String(sort || "newest").toLowerCase();

    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } }
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      priceasc: { price: 1 },
      price_desc: { price: -1 },
      pricedesc: { price: -1 },
      rating: { rating: -1 },
      title: { title: 1 }
    };

    const [books, total, categories] = await Promise.all([
      Book.find(filter).sort(sortMap[normalizedSort] || sortMap.newest).skip(skip).limit(limit),
      Book.countDocuments(filter),
      Book.distinct("category")
    ]);

    res.json({
      books: books || [],
      categories: Array.isArray(categories) ? [...categories].sort() : [],
      pagination: {
        page,
        pages: Math.ceil(total / limit) || 1,
        total: total || 0,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate("reviews.user", "username");
    if (!book) return res.status(404).json({ message: "Book not found." });
    res.json({ book });
  } catch (error) {
    next(error);
  }
};

exports.createBook = async (req, res, next) => {
  try {
    const image = imageUrlFor(req, req.file) || req.body.image;
    const book = await Book.create({ ...req.body, image });
    res.status(201).json({ book });
  } catch (error) {
    next(error);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    const uploadedImage = imageUrlFor(req, req.file);
    if (uploadedImage) updates.image = uploadedImage;

    const book = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!book) return res.status(404).json({ message: "Book not found." });
    res.json({ book });
  } catch (error) {
    next(error);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found." });
    res.json({ message: "Book deleted successfully." });
  } catch (error) {
    next(error);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found." });

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const existing = book.reviews.find((review) => review.user.toString() === req.user._id.toString());
    if (existing) {
      existing.rating = rating;
      existing.comment = comment || "";
    } else {
      book.reviews.push({
        user: req.user._id,
        username: req.user.username,
        rating,
        comment: comment || ""
      });
    }

    book.rating =
      book.reviews.reduce((sum, review) => sum + Number(review.rating), 0) / book.reviews.length;
    await book.save();

    res.status(201).json({ book });
  } catch (error) {
    next(error);
  }
};
