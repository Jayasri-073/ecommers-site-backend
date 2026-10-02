const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Book = require("../models/book");

// Configure Cloudinary if credentials are in process.env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Multer Storage with Memory Storage for Vercel serverless compatibility
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file && file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Helper to upload image buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return reject(new Error("Cloudinary credentials are not configured in environment variables."));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "bookverse_books" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

const processImageUpload = async (req) => {
  if (req.file) {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      return await uploadToCloudinary(req.file.buffer);
    } else {
      console.warn("Cloudinary not configured. Cannot process uploaded file in serverless mode. Falling back to body coverImage.");
      return null;
    }
  }
  return null;
};

const serializeBook = (book) => {
  const serialized = book.toObject ? book.toObject() : book;
  return {
    ...serialized,
    image: serialized.coverImage || serialized.image || ""
  };
};

// @desc    Get all books with optional search & category filter
// @route   GET /api/books
exports.getBooks = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 48);
    const skip = (page - 1) * limit;
    const { search, category, sort = "newest" } = req.query;
    const normalizedSort = String(sort || "newest").toLowerCase();
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } }
      ];
    }

    if (category && category !== "All") {
      query.category = category;
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
      Book.find(query).sort(sortMap[normalizedSort] || sortMap.newest).skip(skip).limit(limit),
      Book.countDocuments(query),
      Book.distinct("category")
    ]);

    res.status(200).json({
      books: books.map(serializeBook),
      categories: Array.isArray(categories) ? [...categories].sort() : [],
      pagination: {
        page,
        pages: Math.ceil(total / limit) || 1,
        total: total || 0,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
};

// @desc    Get a single book by ID
// @route   GET /api/books/:id
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("reviews.user", "username");
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ book: serializeBook(book) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch book", error: error.message });
  }
};

// @desc    Create a new book
// @route   POST /api/books
// @access  Private/Admin
exports.createBook = async (req, res) => {
  try {
    const { title, author, price, stock, category, description, coverImage, publisher, language, isbn } = req.body;

    if (!title || !author || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "Title, author, price, and stock are required" });
    }

    const uploadedCloudinaryUrl = await processImageUpload(req);
    const finalCoverImage = uploadedCloudinaryUrl || coverImage || req.body.image || "";

    const book = await Book.create({
      title,
      author,
      price: Number(price),
      stock: Number(stock),
      category: category || "General",
      description: description || "",
      coverImage: finalCoverImage,
      publisher: publisher || "",
      language: language || "English",
      isbn: isbn || "",
    });

    res.status(201).json({ message: "Book created successfully", book: serializeBook(book) });
  } catch (error) {
    res.status(500).json({ message: "Failed to create book", error: error.message });
  }
};

// @desc    Update an existing book
// @route   PUT /api/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res) => {
  try {
    const { title, author, price, stock, category, description, coverImage, publisher, language, isbn } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const uploadedCloudinaryUrl = await processImageUpload(req);
    if (uploadedCloudinaryUrl) {
      book.coverImage = uploadedCloudinaryUrl;
    } else if (coverImage !== undefined || req.body.image !== undefined) {
      book.coverImage = coverImage !== undefined ? coverImage : req.body.image;
    }

    book.title = title !== undefined ? title : book.title;
    book.author = author !== undefined ? author : book.author;
    book.price = price !== undefined ? Number(price) : book.price;
    book.stock = stock !== undefined ? Number(stock) : book.stock;
    book.category = category !== undefined ? category : book.category;
    book.description = description !== undefined ? description : book.description;
    book.publisher = publisher !== undefined ? publisher : book.publisher;
    book.language = language !== undefined ? language : book.language;
    book.isbn = isbn !== undefined ? isbn : book.isbn;

    const updatedBook = await book.save();
    res.status(200).json({ message: "Book updated successfully", book: serializeBook(updatedBook) });
  } catch (error) {
    res.status(500).json({ message: "Failed to update book", error: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await book.deleteOne();
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete book", error: error.message });
  }
};

// @desc    Add review to book
// @route   POST /api/books/:id/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const alreadyReviewedIndex = book.reviews.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewedIndex !== -1) {
      book.reviews[alreadyReviewedIndex].comment = comment || "";
      book.reviews[alreadyReviewedIndex].rating = Number(rating);
      book.reviews[alreadyReviewedIndex].createdAt = new Date();
    } else {
      book.reviews.push({
        user: req.user._id,
        comment: comment || "",
        rating: Number(rating),
        createdAt: new Date()
      });
    }

    const totalRating = book.reviews.reduce((sum, item) => sum + item.rating, 0);
    book.rating = parseFloat((totalRating / book.reviews.length).toFixed(1));

    await book.save();
    
    const updatedBook = await Book.findById(req.params.id).populate("reviews.user", "username");

    res.status(201).json({ message: "Review saved successfully", book: updatedBook });
  } catch (error) {
    res.status(500).json({ message: "Failed to save review", error: error.message });
  }
};

