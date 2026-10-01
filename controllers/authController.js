const jwt = require("jsonwebtoken");
const User = require("../models/user");

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "bookverse_secret_key_12345",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const sendAuthResponse = (res, statusCode, user, message) => {
  const token = signToken(user);
  res.status(statusCode).json({
    message,
    token,
    user: user.toSafeObject ? user.toSafeObject() : user
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, phone, address, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Save user (mongoose pre-save hook handles hashing)
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      phone: phone || "",
      address: address || "",
      role: role || "user"
    });

    sendAuthResponse(res, 201, user, "User created successfully");
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }

    sendAuthResponse(res, 200, user, "Login successful");
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, phone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username !== undefined) user.username = username;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

// Admin: Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// Admin: Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: "User role updated successfully", user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user role", error: error.message });
  }
};
