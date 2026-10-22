import Note from "../models/Note.js";
import Project from "../models/Project.js"
import { notifyProjectMembers } from "../utils/createNotification.js";
import logActivity from "../utils/logActivity.js";

const isProjectMember = async (projectId, userId) => {
    const project = await Project.findById(projectId);

    if (!project) return null;

    const isOwner = project.owner.toString() === userId;

    const isMember = project.members.some(
        (memberId) => memberId.toString() === userId
    )

    return isOwner || isMember ? project : null
}

export const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const { projectId } = req.params;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Note title is required",
            })
        }

        const project = await isProjectMember(
            projectId,
            req.userId
        )

        if (!project) {
            return res.status(404).json({
                message: "Project not found or access denied"
            })
        }

        const note = await Note.create({
            title: title.trim(),
            content: content || "",
            project: project._id,
            createdBy: req.userId,
        })

        await notifyProjectMembers({
            project,
            message: `A new note "${note.title}" was created.`,
            type: "note",
            excludeUserId: req.userId,
        });

        await logActivity(
            project._id,
            req.userId,
            "created a note",
            note.title
        );

        res.status(201).json({
            message: "Note created successfully",
            note,
        })
    } catch (error) {
        console.error("Create note error", error);
        res.status(500).json({
            message: "Failed to create note",
        })
    }
}


export const getNotes = async (req, res) => {
    try {
        const project = await isProjectMember(req.params.projectId, req.userId)

        if (!project) {
            return res.status(404).json({ message: "Project not found or access denied" })
        }

        const notes = await Note.find({ project: project._id })
            .sort({ UpdatedAt: -1 });

        res.json({ notes })
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch notes" })
    }
}


export const updateNote = async (req, res) => {
    try {
        const project = await isProjectMember(req.params.projectId, req.userId)

        if (!project) {
            return res.status(404).json({ message: "Project not found or access denied" })
        }

        const note = await Note.findOne({
            _id: req.params.noteId,
            project: project._id,
        })

        if (!note) {
            return res.status(404).json({ message: "Note not found" })
        }

        if ((req.body.title !== undefined)) {
            if (!req.body.title.trim()) {
                return res.status(404).json({ message: "Title cannot be empty" })
            }
            note.title = req.body.title.trim()
        }

        if (req.body.content !== undefined) {
            note.content = req.body.content;
        }
        await note.save();
        res.json({ message: "Note updated successfully", note })
    } catch (error) {
        res.status(500).json({ message: "Failed to update note" })
    }
}


export const deleteNote = async (req, res) => {
    try {
        const project = await isProjectMember(req.params.projectId, req.userId)

        if (!project) {
            return res.status(404).json({ message: "Project not found or access denied" })
        }

        const note = await Note.findOneAndDelete({
            _id: req.params.noteId,
            project: project._id,
        })

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json({ message: "Note deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: "Failed to delete note" })
    }
}