const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
} = require("../controllers/cartController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, getCart);
router.post("/", auth, addToCart);
router.put("/:id", auth, updateCartItem);
router.delete("/:id", auth, removeCartItem);

module.exports = router;
