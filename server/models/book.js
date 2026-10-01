const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 800 }
  },
  { timestamps: true }
);

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      maxlength: [140, "Title cannot exceed 140 characters."]
    },
    author: {
      type: String,
      required: [true, "Author is required."],
      trim: true
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
      minlength: [20, "Description must be at least 20 characters."]
    },
    price: {
      type: Number,
      required: [true, "Price is required."],
      min: [0, "Price cannot be negative."]
    },
    image: {
      type: String,
      required: [true, "Book image is required."],
      trim: true
    },
    stock: {
      type: Number,
      required: [true, "Stock is required."],
      min: [0, "Stock cannot be negative."],
      default: 0
    },
    publisher: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true, default: "English" },
    isbn: {
      type: String,
      required: [true, "ISBN is required."],
      unique: true,
      trim: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviews: [reviewSchema]
  },
  { timestamps: true }
);

bookSchema.index({ title: "text", author: "text", category: "text", isbn: "text" });

module.exports = mongoose.model("Book", bookSchema);
