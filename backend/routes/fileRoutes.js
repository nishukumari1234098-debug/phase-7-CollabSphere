
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  uploadFile,
  getProjectFiles,
  downloadFile,
  deleteFile,
} from "../controllers/fileController.js";

const router = express.Router();

router.use(authMiddleware);


router.post("/:projectId", (req, res, next) => {
    console.log("FILE UPLOAD ROUTE HIT");
  upload.single("file")(req, res, (error) => {
    if (error) {
      console.log("MULTER ERROR:", error.message);

      return res.status(400).json({
        message: error.message || "Invalid file upload.",
      });
    }

    console.log("MULTER FILE:", req.file);
    console.log("CONTENT TYPE:", req.headers["content-type"]);

    next();
  });
}, uploadFile);


router.get("/:projectId", getProjectFiles);
router.get("/:projectId/:fileId/download", downloadFile);
router.delete("/:projectId/:fileId", deleteFile);

export default router;
