import Project from "../models/Project.js";
import User from "../models/User.js";

export const createProject = async (req, res) => {
    try {
        const { name, description } = req.body

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Projeect name is required"
            })
        }

        const project = await Project.create({
            name: name.trim(),
            description: description || "",
            owner: req.userId,
            members: [req.userId]
        });

        res.status(201).json({
            message: "Project created successfully",
            project,
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to create projects"
        })
    }
}



export const getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ members: req.userId })
            .populate("owner", "name email")
            .populate("members", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ projects });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch projects",
        });
    }
};



export const addMember = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({
                message: "Member email is required"
            })
        }

        const project = await Project.findById(req.params.id)

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            })
        }

        if (project.owner.toString() !== req.userId) {
            return res.status(403).json({
                message: "Only the project owner can add members"
            })
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        })

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        if (project.members.some((id) => id.equals(user._id))) {
            return res.status(409).json({
                message: "User is already a member"
            })
        }

        project.members.push(user._id);
        await project.save()

        res.json({
            message: "Member added successfully",
            projects
        })
    } catch (error) {
        console.error("Add member error:", error)
        res.status(500).json({
            message: "Failed to add member"
        })
    }
}


export const getPublicProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            isPublic: true,
        }).select("name description isPublic createdAt");

        if (!project) {
            return res.status(404).json({
                message: "Public project not found.",
            });
        }

        return res.status(200).json({ project });
    } catch (error) {
        // Invalid MongoDB IDs can cause a CastError.
        if (error.name === "CastError") {
            return res.status(404).json({
                message: "Public project not found.",
            });
        }

        console.error("Get public project error:", error.message);
        return res.status(500).json({
            message: "Failed to load public project.",
        });
    }
};


export const toggleProjectPublic = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found.",
            });
        }

        if (String(project.owner) !== String(req.userId)) {
            return res.status(403).json({
                message: "Only the project owner can change sharing settings.",
            });
        }

        project.isPublic = Boolean(req.body.isPublic);
        await project.save();

        return res.json({
            message: project.isPublic
                ? "Project is now public."
                : "Project is now private.",
            project: {
                _id: project._id,
                name: project.name,
                isPublic: project.isPublic,
            },
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                message: "Project not found.",
            });
        }

        console.error("Toggle project visibility error:", error.message);
        return res.status(500).json({
            message: "Failed to update project visibility.",
        });
    }
};