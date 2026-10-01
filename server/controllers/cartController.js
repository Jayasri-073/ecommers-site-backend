const Cart = require("../models/cart");
const Book = require("../models/book");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.book");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate("items.book");
  }
  return cart;
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json({ cart });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    const qty = Number(quantity);

    if (!bookId || qty < 1) {
      return res.status(400).json({ message: "Book and positive quantity are required." });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found." });
    if (book.stock < qty) return res.status(400).json({ message: "Requested quantity exceeds stock." });

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((item) => item.book._id.toString() === bookId);

    if (existing) {
      const nextQuantity = existing.quantity + qty;
      if (book.stock < nextQuantity) {
        return res.status(400).json({ message: "Requested quantity exceeds stock." });
      }
      existing.quantity = nextQuantity;
      existing.priceAtAdd = book.price;
    } else {
      cart.items.push({ book: book._id, quantity: qty, priceAtAdd: book.price });
    }

    await cart.save();
    await cart.populate("items.book");
    res.status(201).json({ cart });
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const qty = Number(quantity);
    if (qty < 1) return res.status(400).json({ message: "Quantity must be at least 1." });

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(req.params.id);
    if (!item) return res.status(404).json({ message: "Cart item not found." });

    const book = await Book.findById(item.book._id || item.book);
    if (!book) return res.status(404).json({ message: "Book not found." });
    if (book.stock < qty) return res.status(400).json({ message: "Requested quantity exceeds stock." });

    item.quantity = qty;
    item.priceAtAdd = book.price;
    await cart.save();
    await cart.populate("items.book");
    res.json({ cart });
  } catch (error) {
    next(error);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(req.params.id);
    if (!item) return res.status(404).json({ message: "Cart item not found." });

    item.deleteOne();
    await cart.save();
    await cart.populate("items.book");
    res.json({ cart });
  } catch (error) {
    next(error);
  }
};
