
import express from "express";
import {
  explainCode,
  generateDocs,
  generateReadme,
} from "../controllers/geminiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/explain", authMiddleware, explainCode);
router.post("/docs", authMiddleware, generateDocs);
router.post("/readme", authMiddleware, generateReadme);

export default router;
