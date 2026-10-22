
import Activity from "../models/Activity.js";
import Project from "../models/Project.js";

export async function getProjectActivity(req, res) {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { owner: req.userId },
        { members: req.userId },
      ],
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or access denied.",
      });
    }

    const activities = await Activity.find({
      project: project._id,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({ activities });
  } catch (error) {
    console.error("Get project activity error:", error);
    return res.status(500).json({
      message: "Could not load project activity.",
    });
  }
}
