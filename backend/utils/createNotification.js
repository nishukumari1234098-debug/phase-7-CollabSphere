
import Notification from "../models/Notification.js";

export async function notifyProjectMembers({
  project,
  message,
  type,
  excludeUserId,
}) {
  const recipients = project.members
    .map((member) => member._id || member)
    .filter((id) => id.toString() !== excludeUserId?.toString());

  if (recipients.length === 0) return;

  await Notification.insertMany(
    recipients.map((recipient) => ({
      recipient,
      project: project._id,
      message,
      type,
    }))
  );
}
