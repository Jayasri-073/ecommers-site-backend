const Cart = require("../models/cart");
const Book = require("../models/book");

const buildCartResponse = async (cartDoc) => {
  if (!cartDoc) {
    return { items: [], totalPrice: 0 };
  }

  const populatedCart = await cartDoc.populate("items.bookId");
  const items = (populatedCart.items || []).map((item) => {
    const book = item.bookId ? item.bookId.toObject ? item.bookId.toObject() : item.bookId : null;
    const price = Number(item.price || book?.price || 0);
    const quantity = Number(item.quantity || 0);

    return {
      _id: item._id,
      book,
      quantity,
      price,
    };
  });

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    items,
    totalPrice,
  };
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate("items.bookId");
  if (!cart) {
    cart = await Cart.create({ userId, items: [], totalPrice: 0 });
    cart = await cart.populate("items.bookId");
  }
  return cart;
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const response = await buildCartResponse(cart);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch cart", error: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.items.find((item) => item.bookId && item.bookId.toString() === bookId);

    if (existingItem) {
      existingItem.quantity += qty;
      existingItem.price = Number(book.price || existingItem.price || 0);
    } else {
      cart.items.push({
        bookId,
        quantity: qty,
        price: Number(book.price || 0),
      });
    }

    cart.totalPrice = cart.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
    await cart.save();

    const response = await buildCartResponse(cart);
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add item to cart", error: error.message });
  }
};

// @desc    Update quantity of item in cart
// @route   PUT /api/cart/:id
// @access  Private
exports.updateCartQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (Number.isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "Valid quantity greater than 0 is required" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const cartItem = cart.items.id(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cartItem.quantity = qty;
    if (cartItem.bookId) {
      const book = await Book.findById(cartItem.bookId);
      if (book) {
        cartItem.price = Number(book.price || 0);
      }
    }

    cart.totalPrice = cart.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
    await cart.save();

    const response = await buildCartResponse(cart);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update cart", error: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const cartItem = cart.items.id(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cartItem.deleteOne();
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
    await cart.save();

    const response = await buildCartResponse(cart);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove item from cart", error: error.message });
  }
};

// @desc    Clear the user's cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    return res.status(200).json({ items: [], totalPrice: 0 });
  } catch (error) {
    return res.status(500).json({ message: "Failed to clear cart", error: error.message });
  }
};
