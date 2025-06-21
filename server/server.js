import express from 'express';
import "dotenv/config";
import cors from "cors";
import http from 'http';
import { connectDB } from './lib/db.js';
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
    cors: { origin: "*" }
});

// Map userId to array of socket ids
export const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("Socket connected, id:", socket.id);

    // Wait for authenticate event with userId
    socket.on("authenticate", ({ userId }) => {
        if (!userId) {
            console.warn("Authenticate event received without userId");
            return;
        }
        console.log("User authenticated:", userId);

        if (!userSocketMap[userId]) {
            userSocketMap[userId] = [];
        }
        userSocketMap[userId].push(socket.id);

        // Emit updated online users list
        io.emit("getOnlineUser", Object.keys(userSocketMap));

        // When this socket disconnects, remove it from map
        socket.on("disconnect", () => {
            console.log("User disconnected", userId, socket.id);

            if (userSocketMap[userId]) {
                userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);

                if (userSocketMap[userId].length === 0) {
                    delete userSocketMap[userId];
                }
            }

            io.emit("getOnlineUser", Object.keys(userSocketMap));
        });
    });

    // Optional: Handle case where client never authenticates and disconnects
    socket.on("disconnect", () => {
        // This disconnect will fire if the user never authenticated
        console.log("Socket disconnected without authentication:", socket.id);
    });
});

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRoutes);

app.use("/api/messages", messageRoutes);

// Server start with DB connection
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();
        console.log("MongoDB connected");

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}

// Start the server
startServer();

// Optional: Handle uncaught errors
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
