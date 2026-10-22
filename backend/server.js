
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import Project from "./models/Project.js";
import Message from "./models/Message.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST"],
  },
});

connectDB();

app.use(cors());
app.use(express.json());

// Existing API routes
app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to collabSphere API!");
});

app.get("/api/chat/status", (req, res) => {
  res.json({ message: "Chat server is ready" });
});

// Make Socket.IO available to controllers
app.set("io", io);

// Authenticate Socket.IO connections using existing JWT
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId =
      decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return next(new Error("User ID missing from token"));
    }

    socket.userId = userId.toString();
    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

// Project-wise team chat
io.on("connection", (socket) => {
  console.log("Authenticated chat client connected");

  socket.on("chat:join", async (projectId, callback) => {
    try {
      if (!mongoose.isValidObjectId(projectId)) {
        return callback?.({
          ok: false,
          message: "Invalid project ID",
        });
      }

      // Only project members and owner can join
      const project = await Project.findOne({
        _id: projectId,
        $or: [
          { owner: socket.userId },
          { members: socket.userId },
        ],
      });

      if (!project) {
        return callback?.({
          ok: false,
          message: "Project access denied",
        });
      }

      // Leave any previously joined project chat room
      for (const room of socket.rooms) {
        if (room.startsWith("project:")) {
          socket.leave(room);
        }
      }

      socket.join(`project:${projectId}`);

      // Load the latest 100 messages
      const messages = await Message.find({
        project: projectId,
      })
        .populate("sender", "name email")
        .sort({ createdAt: -1 })
        .limit(100);

      callback?.({
        ok: true,
        messages: messages.reverse(),
      });
    } catch (error) {
      console.error("Chat room error:", error.message);

      callback?.({
        ok: false,
        message: "Unable to join chat",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Chat client disconnected");
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
