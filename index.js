require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const Book = require("./models/book");
const User = require("./models/user");
const seedData = require("./seedData.json");

const app = express();

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed"), false);
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically (legacy fallback for local files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Global Mongoose Connection Caching for Serverless Execution
let cached = global.mongooseCache;
if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

let isSeeded = false;

async function connectToDatabase() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is missing.");
    }

    cached.promise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    }).then((mongooseInstance) => {
      console.log("Connected to MongoDB successfully");
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  if (!isSeeded) {
    await seedDatabase();
    isSeeded = true;
  }

  return cached.conn;
}

// Seed function
async function seedDatabase() {
  try {
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      console.log("Seeding books to MongoDB...");
      await Book.insertMany(seedData.books);
      console.log("Books seeded successfully!");
    } else {
      const existingIsbns = new Set(
        (await Book.find({ isbn: { $in: seedData.books.map((book) => book.isbn) } }).select("isbn -_id"))
          .map((book) => book.isbn)
      );
      const missingBooks = seedData.books.filter((book) => !existingIsbns.has(book.isbn));
      if (missingBooks.length > 0) {
        await Book.insertMany(missingBooks);
        console.log(`${missingBooks.length} new books added to MongoDB.`);
      }
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("Seeding users to MongoDB...");
      for (const u of seedData.users) {
        await User.create(u);
      }
      console.log("Users seeded successfully!");
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

// Ensure Database connection for every incoming request
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("Database connection error:", err.message);
    res.status(500).json({ message: "Database connection failed", error: err.message });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the BookVerse E-commerce API",
    status: "online",
    environment: process.env.NODE_ENV || "development"
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Setup Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling Middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "Image must be 5 MB or smaller"
      : error.message;
    return res.status(400).json({ message });
  }

  if (error.message === "Only images are allowed!") {
    return res.status(400).json({ message: error.message });
  }

  console.error("Global Error Handler:", error);
  res.status(error.status || 500).json({
    message: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message
  });
});

// Start persistent server only when running locally (not on Vercel serverless)
if (require.main === module || process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

// Export Express app for Vercel Serverless Functions
module.exports = app;



