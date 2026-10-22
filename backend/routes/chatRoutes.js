
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getMessages,
  sendMessage,
} from "../controllers/chatController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/:projectId/messages", getMessages);
router.post("/:projectId/messages", sendMessage);

export default router;
