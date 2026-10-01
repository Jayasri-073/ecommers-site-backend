const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart } = require("../controllers/cartController");
const auth = require("../middleware/auth");

router.use(auth); // Protect all cart routes

router.route("/")
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route("/:id")
  .put(updateCartQuantity)
  .delete(removeFromCart);

module.exports = router;
