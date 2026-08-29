import api from "./api";

export const projectService = {
  async getProjects() {
    const res = await api.get("/projects/");
    return res.data;
  },

  async getProject(id) {
    const res = await api.get(`/projects/${id}/`);
    return res.data;
  },

  async createProject(projectData) {
    const res = await api.post("/projects/", projectData);
    return res.data;
  },

  async updateProject(id, projectData) {
    const res = await api.patch(`/projects/${id}/`, projectData);
    return res.data;
  },

  async deleteProject(id) {
    const res = await api.delete(`/projects/${id}/`);
    return res.data;
  },

  async toggleFavorite(project) {
    const res = await api.patch(`/projects/${project.id}/`, {
      is_favorite: !project.is_favorite,
    });
    return res.data;
  },
};
