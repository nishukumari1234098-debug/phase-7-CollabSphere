
import Activity from "../models/Activity.js";

export default async function logActivity(
  projectId,
  userId,
  action,
  details = ""
) {
  try {
    await Activity.create({
      project: projectId,
      user: userId,
      action,
      details,
    });
  } catch (error) {
    console.error("Activity logging failed:", error.message);
  }
}
