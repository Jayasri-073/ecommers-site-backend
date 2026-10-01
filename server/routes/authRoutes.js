const express = require("express");
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

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.get("/users", auth, admin, getUsers);
router.put("/users/:id/role", auth, admin, updateUserRole);

module.exports = router;
