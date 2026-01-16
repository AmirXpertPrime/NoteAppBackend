const express = require("express");
const router = express.Router();
const { signup, login, logout } = require("../controller/authController");

// Signup Route
router.post("/signup", signup);

// Login Route
router.post("/login", login);

// Logout Route
router.post("/logout", logout);

module.exports = router;
