
import api from "./api";

const notificationService = {
  async getAll() {
    const response = await api.get("/notifications");
    return response.data.notifications;
  },

  async markRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllRead() {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },
};

export default notificationService;
