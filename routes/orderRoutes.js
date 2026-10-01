const express = require("express");
const router = express.Router();
const { createOrder, getUserOrders, getAllOrders, updateOrderStatus } = require("../controllers/orderController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.route("/")
  .post(auth, createOrder)
  .get(auth, admin, getAllOrders);

router.route("/my-orders")
  .get(auth, getUserOrders);

router.route("/:id/status")
  .put(auth, admin, updateOrderStatus);

module.exports = router;
