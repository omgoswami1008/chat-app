import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        // Accept token from Authorization header (Bearer token) or from token header
        const authHeader = req.headers.authorization || req.headers.token;

        let token;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (authHeader) {
            token = authHeader;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided, authorization denied",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // User ID could be in id or userId depending on token generation
        const userId = decoded.userId || decoded.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Token payload invalid",
            });
        }

        // Find user by id
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found, authorization denied",
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error("protectRoute error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Token is not valid",
        });
    }
};
