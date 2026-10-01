require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const Book = require("./models/book");
const User = require("./models/user");
const seedData = require("./seedData.json");
const app = express();
const multer = require("multer"); 
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bookverse";
// Enable CORS
app.use((req, res, next) => {
  const allowedOrigins = new Set([
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:3000"
  ]);
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Connect to Database and Seed Books and Users if empty
mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log(`Connected to MongoDB at ${mongoUri}`);
    await seedDatabase();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

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
      // Save users (their passwords will be hashed by the mongoose pre-save hook)
      for (const u of seedData.users) {
        await User.create(u);
      }
      console.log("Users seeded successfully!");
    }
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce site backend!");
});

// Setup Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

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

  next(error);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



