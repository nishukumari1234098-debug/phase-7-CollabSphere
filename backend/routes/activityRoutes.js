
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getProjectActivity } from "../controllers/activityController.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/:projectId", getProjectActivity);

export default router;
