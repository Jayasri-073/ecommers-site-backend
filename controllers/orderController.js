const Order = require("../models/order");
const Book = require("../models/book");
const Cart = require("../models/cart");

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { address, phone, items: checkoutItems } = req.body;

    if (!address || !phone) {
      return res.status(400).json({ message: "Address and phone are required" });
    }

    let itemsToProcess = [];

    // If checkoutItems are passed, use them. Otherwise, grab from user's backend Cart
    if (checkoutItems && checkoutItems.length > 0) {
      itemsToProcess = checkoutItems;
    } else {
      const cart = await Cart.findOne({ userId: req.user._id }).populate("items.bookId");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      itemsToProcess = cart.items.map((item) => ({
        bookId: item.bookId?._id || item.bookId,
        quantity: item.quantity,
      }));
    }

    // Verify stock and prepare order items
    const orderItems = [];
    let totalAmount = 0;
    const placeOrderMap = new Map();
    let firstBookTitle = "";

    for (const item of itemsToProcess) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(404).json({ message: `Book not found with ID ${item.bookId}` });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for book: ${book.title}. Available: ${book.stock}` });
      }

      // Decrement stock
      book.stock -= item.quantity;
      await book.save();

      // Add to order items list
      orderItems.push({
        bookId: book._id,
        title: book.title,
        price: book.price,
        quantity: item.quantity,
      });

      totalAmount += book.price * item.quantity;

      // Populate placeOrderdata map for compatibility
      placeOrderMap.set(book.title, item.quantity);

      if (!firstBookTitle) {
        firstBookTitle = book.title;
      }
    }

    // Create the order
    const order = await Order.create({
      userId: req.user._id,
      username: req.user.username,
      bookname: firstBookTitle || "E-books Order",
      rackname: "Rack " + (Math.floor(Math.random() * 5) + 1), // Compatible mock rack
      items: orderItems,
      totalAmount,
      address,
      phone,
      placeOrderdata: placeOrderMap,
    });

    // Clear backend cart for the user on successful checkout
    await Cart.deleteMany({ userId: req.user._id });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your orders", error: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status", error: error.message });
  }
};
