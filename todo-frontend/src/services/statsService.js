import api from "./api";

export const statsService = {
  async getStats() {
    const res = await api.get("/stats/");
    return res.data;
  },
};
