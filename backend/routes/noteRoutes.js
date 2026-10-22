import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/:projectId", createNote);
router.get("/:projectId", getNotes);
router.put("/:projectId/:noteId", updateNote);
router.delete("/:projectId/:noteId", deleteNote);

export default router;