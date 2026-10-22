
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(-100);

    cb(null, `${Date.now()}-${safeName}`);
  },
});

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/plain",
];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, PNG and TXT files are allowed."));
    }
  },
});

export default upload;
