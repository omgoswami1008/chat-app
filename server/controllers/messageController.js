import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get all users except logged-in user, plus unseen message counts
export const getUserForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get users except current user
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        // Object to hold unseen message counts by userId
        const unseenMessage = {};

        // For each user, find unseen messages sent to logged-in user
        await Promise.all(
            filteredUsers.map(async (user) => {
                const count = await Message.countDocuments({
                    senderId: user._id,
                    receiverId: userId,
                    seen: false,
                });
                if (count > 0) unseenMessage[user._id] = count;
            })
        );

        res.json({ success: true, users: filteredUsers, unseenMessage });
    } catch (error) {
        console.error("getUserForSidebar error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get messages between logged-in user and selected user
export const getMessage = async (req, res) => {
    try {
        const selectedUserId = req.params.id;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ],
        }).sort({ createdAt: 1 }); // Sort by time ascending

        // Mark all messages received from selected user as seen
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false },
            { seen: true }
        );

        res.json({ success: true, messages });
    } catch (error) {
        console.error("getMessage error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark a single message as seen
export const markMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });
    } catch (error) {
        console.error("markMessage error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark all messages from a sender as seen by logged-in user
export const markMessagesFromUser = async (req, res) => {
    try {
        const { senderId } = req.params;
        const receiverId = req.user._id;

        await Message.updateMany(
            { senderId, receiverId, seen: false },
            { seen: true }
        );

        res.json({ success: true });
    } catch (error) {
        console.error("markMessagesFromUser error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send a message (text or image)
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            createdAt: new Date(),
        });

        // Emit new message via socket.io if receiver is online
        const receiverSocketIds = userSocketMap[receiverId] || [];
        receiverSocketIds.forEach((socketId) => {
            io.to(socketId).emit("newMessage", newMessage);
        });

        res.json({ success: true, newMessage });
    } catch (error) {
        console.error("sendMessage error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
