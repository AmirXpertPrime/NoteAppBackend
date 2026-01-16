const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getTokenCookieOptions() {
    const isProd = process.env.NODE_ENV === "production";

    // NOTE:
    // - If your frontend and backend are on DIFFERENT sites in production, you likely need:
    //   sameSite: "none" + secure: true
    // - For local dev on localhost, "lax" is usually fine.
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 60 * 60 * 1000, // 1 hour (match JWT expiry below)
    };
}

// Helper function to validate email
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Signup Controller
const signup = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ message: "Body required" });
    }
    const { fullName, email, password, confirmPassword } = req.body;

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    if (!fullName || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });
        console.log('newUser =>', newUser);
        await newUser.save();

        // Create JWT Token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, getTokenCookieOptions());
        res.status(201).json({ token, user: { id: newUser._id, fullName, email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Login Controller
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        console.log('User from MongoDB', user);
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Send JWT in HttpOnly cookie
        res.cookie("token", token, getTokenCookieOptions());
        res.json({ token, user: { id: user._id, fullName: user.fullName, email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const logout = async (req, res) => {
    // Clear the auth cookie
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ message: "Logged out" });
};

module.exports = {
    signup,
    login,
    logout
};

