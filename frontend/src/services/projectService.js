
import api from "./api";

const projectService = {
  async getProjects() {
    const response = await api.get("/projects");
    return response.data.projects;
  },

  async creatProject(projectData) {
    const response = await api.post("/projects", projectData);
    return response.data;
  },

  async addMember(projectId, email) {
    const response = await api.post(`/projects/${projectId}/members`, {
      email: email.trim().toLowerCase(),
    });
    return response.data;
  },

  async setPublic(projectId, isPublic) {
    const response = await api.patch(`/projects/${projectId}/public`, {
      isPublic,
    });
    return response.data;
  },

  async getPublicProject(projectId) {
    // Public endpoint: no authentication required.
    const response = await api.get(`/projects/public/${projectId}`);
    return response.data.project;
  },
};

export default projectService;
