import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../lib/utlies.js";
import cloudinary from "../lib/cloudinary.js";

// ✅ Signup a new user
export const signUp = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        // Validate input
        if (!fullName || !email || !password || !bio) {
            return res.json({
                success: false,
                message: "Missing details",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({
                success: false,
                message: "Account already exists",
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio,
        });

        // Generate JWT token
        const token = generateToken(newUser._id);

        // Send response
        return res.json({
            success: true,
            userData: newUser,
            token,
            message: "Account created successfully",
        });
    } catch (error) {
        console.error("Signup Error:", error.message);
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// ✅ Login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const userData = await User.findOne({ email });
        if (!userData) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        // Generate token
        const token = generateToken(userData._id);

        return res.json({
            success: true,
            userData,
            token,
            message: "Login successful",
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        return res.json({ success: false, message: error.message });
    }
};

// ✅ Check if user is authenticated
export const checkAuth = (req, res) => {
    // req.user should be set by auth middleware after token verification
    res.json({ success: true, user: req.user });
};

// ✅ Update user profile details
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updatedUser;

        if (!profilePic) {
            // Update bio and fullName only
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { bio, fullName },
                { new: true }
            );
        } else {
            // Upload new profilePic to Cloudinary
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { profilePic: upload.secure_url, bio, fullName },
                { new: true }
            );
        }

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Update Profile Error:", error.message);
        return res.json({ success: false, message: error.message });
    }
};
