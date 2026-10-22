
import fs from "fs/promises";
import path from "path";
import File from "../models/File.js";
import Project from "../models/Project.js";
import { notifyProjectMembers } from "../utils/createNotification.js";
import logActivity from "../utils/logActivity.js";

async function hasProjectAccess(projectId, userId) {
    const project = await Project.findOne({
        _id: projectId,
        members: userId,
    });

    return project;
}


export async function uploadFile(req, res) {
    console.log("Uploaded file:", req.file);
    let savedFile;

    try {
        const project = await hasProjectAccess(req.params.projectId, req.userId);

        if (!project) {
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => { });
            }

            return res.status(404).json({
                message: "Project not found or access denied.",
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Please select a file." });
        }

        savedFile = await File.create({
            originalName: req.file.originalname,
            storedName: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            project: project._id,
            uploadedBy: req.userId,
        });

        await notifyProjectMembers({
            project,
            message: `A new file "${savedFile.originalName}" was shared.`,
            type: "file",
            excludeUserId: req.userId,
        });

        await logActivity({
            projectId: project._id,
            userId: req.userId,
            action: "uploaded a file",
            details: savedFile.originalName,
        });

        return res.status(201).json({
            message: "File uploaded successfully.",
            file: savedFile,
        });
    } catch (error) {
        if (req.file && !savedFile) {
            await fs.unlink(req.file.path).catch(() => { });
        }

        console.error("Upload file error:", error.message);
        return res.status(500).json({ message: "File upload failed." });
    }
}

export async function getProjectFiles(req, res) {
    try {
        const project = await hasProjectAccess(req.params.projectId, req.userId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found or access denied.",
            });
        }

        const files = await File.find({ project: project._id })
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        return res.json({ files });
    } catch (error) {
        console.error("Get project files error:", error.message);
        return res.status(500).json({ message: "Could not load project files." });
    }
}


export async function downloadFile(req, res) {
    try {
        const project = await hasProjectAccess(req.params.projectId, req.userId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found or access denied.",
            });
        }

        const file = await File.findOne({
            _id: req.params.fileId,
            project: project._id,
        });

        if (!file) {
            return res.status(404).json({ message: "File not found." });
        }

        const filePath = path.resolve("uploads", file.storedName);

        return res.download(filePath, file.originalName, (error) => {
            if (error && !res.headersSent) {
                res.status(404).json({ message: "File could not be downloaded." });
            }
        });
    } catch (error) {
        console.error("Download file error:", error.message);
        return res.status(500).json({ message: "Download failed." });
    }
}


export async function deleteFile(req, res) {
    try {
        const project = await hasProjectAccess(
            req.params.projectId,
            req.userId
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found or access denied.",
            });
        }

        const file = await File.findOne({
            _id: req.params.fileId,
            project: project._id,
        });

        if (!file) {
            return res.status(404).json({
                message: "File not found.",
            });
        }

        // Only the uploader or project owner can delete this file.
        const isUploader =
            file.uploadedBy.toString() === req.userId.toString();

        const isProjectOwner =
            project.owner.toString() === req.userId.toString();

        if (!isUploader && !isProjectOwner) {
            return res.status(403).json({
                message: "Only the uploader or project owner can delete this file.",
            });
        }

        const filePath = path.resolve("uploads", file.storedName);

        // Remove the physical file first, if it exists.
        await fs.unlink(filePath).catch((error) => {
            if (error.code !== "ENOENT") {
                throw error;
            }
        });

        await File.findByIdAndDelete(file._id);

        await notifyProjectMembers({
            project,
            message: `File "${file.originalName}" was deleted.`,
            type: "file",
            excludeUserId: req.userId,
        });

        await logActivity({
            projectId: project._id,
            userId: req.userId,
            action: "deleted a file",
            details: file.originalName,
        });

        return res.json({
            message: "File deleted successfully.",
        });
    } catch (error) {
        console.error("Delete file error:", error.message);
        return res.status(500).json({
            message: "File deletion failed.",
        });
    }
}