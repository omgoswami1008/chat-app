import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
    getUserForSidebar,
    getMessage,
    markMessage,
    markMessagesFromUser,
    sendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

// Get users for sidebar + unseen messages count
router.get("/users", protectRoute, getUserForSidebar);

// Get messages with a selected user
router.get("/:id", protectRoute, getMessage);

// Mark a single message as seen
router.patch("/mark/:id", protectRoute, markMessage);

// Mark all messages from a sender as seen
router.patch("/mark-from-user/:senderId", protectRoute, markMessagesFromUser);

// Send a message to a user
router.post("/send/:id", protectRoute, sendMessage);

export default router;
