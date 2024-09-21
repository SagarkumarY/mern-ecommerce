import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Protect Route Middleware
export const protectRoute = async (req, res, next) => {
    try {
        // Extract the access token from cookies
        const accessToken = req.cookies.accessToken;

        // Check if the access token exists
        if (!accessToken) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        try {
            // Verify the token
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

            // Find the user by the ID stored in the token
            const user = await User.findById(decoded.id).select("-password");

            // Check if the user exists
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            // Attach user to request object
            req.user = user;

            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            // Handle token expiration errors separately
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Access token expired" });
            }
            throw error;
        }
    } catch (error) {
        console.error("Error in protectRoute middleware", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

// Admin Route Middleware
export const adminRoute = async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ message: "Not authorized to access this route. Admins only." });
    }
};
