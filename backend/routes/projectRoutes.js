import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createProject,
  getMyProjects,
  addMember,
  getPublicProject,
  toggleProjectPublic,
} from "../controllers/projectController.js";

const router = express.Router();

// Public route must come BEFORE authMiddleware.
router.get("/public/:id", getPublicProject);

router.use(authMiddleware);

router.post("/:id/members", addMember);
router.patch("/:id/public", toggleProjectPublic);
router.post("/", createProject);
router.get("/", getMyProjects);

export default router;