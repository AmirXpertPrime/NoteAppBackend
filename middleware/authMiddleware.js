const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication Middleware
const authenticate = async (req, res, next) => {
    try {
        // Prefer HttpOnly cookie token; fall back to Authorization header (Bearer <token>)
        const cookieToken = req.cookies?.token;
        const headerToken = req.header("Authorization")?.replace(/^Bearer\s+/i, "");
        const token = cookieToken || headerToken;

        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {

            return res.status(401).json({ message: "Token is not valid" });
        }
        // Attach user to request
        req.user = { id: user._id };
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = authenticate;

