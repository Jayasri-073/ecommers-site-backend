require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/user");
const Book = require("../models/book");
const Cart = require("../models/cart");
const Order = require("../models/order");
const seedData = require("./seedData.json");

const seedDatabase = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Book.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({})
  ]);

  await User.insertMany(seedData.users);
  await Book.insertMany(seedData.books);

  console.log("BookVerse seed data inserted.");
  console.log("Admin login: admin@bookverse.com / Admin123!");
  console.log("User login: reader@bookverse.com / Reader123!");
  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
