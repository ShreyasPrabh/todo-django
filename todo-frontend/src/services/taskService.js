import api from "./api";

export const taskService = {
  async getTasks({ view = "inbox", search = "", projectId = null, priority = null } = {}) {
    const params = { view };
    if (search) params.search = search;
    if (projectId) {
      params.view = "project";
      params.project_id = projectId;
    }
    if (priority) {
      params.view = "priority";
      params.priority = priority;
    }

    const res = await api.get("/tasks/", { params });
    return res.data;
  },

  async getTask(id) {
    const res = await api.get(`/tasks/${id}/`);
    return res.data;
  },

  async createTask(taskData) {
    const res = await api.post("/tasks/", taskData);
    return res.data;
  },

  async updateTask(id, taskData) {
    const res = await api.patch(`/tasks/${id}/`, taskData);
    return res.data;
  },

  async deleteTask(id) {
    const res = await api.delete(`/tasks/${id}/`);
    return res.data;
  },

  async toggleComplete(id) {
    const res = await api.post(`/tasks/${id}/toggle/`);
    return res.data;
  },

  async addSubtask(parentTaskId, title) {
    const res = await api.post(`/tasks/${parentTaskId}/subtasks/`, { title });
    return res.data;
  },
};
