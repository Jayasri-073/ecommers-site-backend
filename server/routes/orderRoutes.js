const express = require("express");
const { createOrder, getOrders, updateOrder } = require("../controllers/orderController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

router.post("/", auth, createOrder);
router.get("/", auth, getOrders);
router.put("/:id", auth, admin, updateOrder);

module.exports = router;
