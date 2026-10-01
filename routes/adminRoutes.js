const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/register", async (req, res) => {
  try {
    const { username, name, email, password, phone, address } = req.body;
    const adminName = username || name;

    if (!adminName || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const admin = await User.create({
      username: adminName,
      email,
      password,
      phone,
      address,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        address: admin.address,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating admin",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching admins",
      error: error.message,
    });
  }
});

module.exports = router;
