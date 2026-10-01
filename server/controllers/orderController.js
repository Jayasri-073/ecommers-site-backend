const Cart = require("../models/cart");
const Book = require("../models/book");
const Order = require("../models/order");

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: "Shipping address and payment method are required." });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.book");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    const orderBooks = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const book = item.book;
      if (!book) return res.status(400).json({ message: "A cart item references a missing book." });
      if (book.stock < item.quantity) {
        return res.status(400).json({ message: `${book.title} has only ${book.stock} copies left.` });
      }

      orderBooks.push({
        book: book._id,
        title: book.title,
        author: book.author,
        image: book.image,
        price: book.price,
        quantity: item.quantity
      });
      totalAmount += book.price * item.quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      books: orderBooks,
      shippingAddress,
      paymentMethod,
      totalAmount,
      paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Paid"
    });

    await Promise.all(
      cart.items.map((item) =>
        Book.findByIdAndUpdate(item.book._id, { $inc: { stock: -item.quantity } })
      )
    );
    cart.items = [];
    await cart.save();

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    const orders = await Order.find(filter)
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const allowed = ["paymentStatus", "orderStatus"];
    const updates = {};

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate("user", "username email");

    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ order });
  } catch (error) {
    next(error);
  }
};
