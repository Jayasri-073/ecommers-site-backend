const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  getUsers,
  updateUserRole
} = require("../controllers/authController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.post("/register", register);
router.post("/login", login);

router.route("/profile")
  .get(auth, getProfile)
  .put(auth, updateProfile);

router.route("/users")
  .get(auth, admin, getUsers);

router.route("/users/:id/role")
  .put(auth, admin, updateUserRole);

module.exports = router;

