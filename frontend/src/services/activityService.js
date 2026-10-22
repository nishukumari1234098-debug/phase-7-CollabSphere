
import api from "./api";

const activityService = {
  async getProjectActivity(projectId) {
    const response = await api.get(`/activity/${projectId}`);
    return response.data.activities;
  },
};

export default activityService;
