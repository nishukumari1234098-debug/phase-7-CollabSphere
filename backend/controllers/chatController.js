
import mongoose from "mongoose";
import Project from "../models/Project.js";
import Message from "../models/Message.js";

const isProjectMember = async (projectId, userId) => {
  if (!mongoose.isValidObjectId(projectId)) return false;

  return Project.exists({
    _id: projectId,
    $or: [
      { owner: userId },
      { members: userId },
    ],
  });
};

export const getMessages = async (req, res) => {
  try {
    const allowed = await isProjectMember(
      req.params.projectId,
      req.userId
    );

    if (!allowed) {
      return res.status(403).json({
        message: "Project access denied",
      });
    }

    const messages = await Message.find({
      project: req.params.projectId,
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error.message);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    if (text.trim().length > 2000) {
      return res.status(400).json({
        message: "Message cannot exceed 2000 characters",
      });
    }

    const allowed = await isProjectMember(
      req.params.projectId,
      req.userId
    );

    if (!allowed) {
      return res.status(403).json({
        message: "Project access denied",
      });
    }

    const message = await Message.create({
      project: req.params.projectId,
      sender: req.userId,
      text: text.trim(),
    });

    const populatedMessage = await message.populate(
      "sender",
      "name email"
    );

    const io = req.app.get("io");

    io.to(`project:${req.params.projectId}`).emit(
      "chat:new-message",
      populatedMessage
    );

    res.status(201).json({
      message: "Message sent",
      chatMessage: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error.message);
    res.status(500).json({ message: "Failed to send message" });
  }
};
