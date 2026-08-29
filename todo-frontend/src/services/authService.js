import api from "./api";

export const authService = {
  async signup(username, email, password) {
    const res = await api.post("/auth/signup/", { username, email, password });
    if (res.data.tokens) {
      sessionStorage.setItem("todoist_access_token", res.data.tokens.access);
      sessionStorage.setItem("todoist_refresh_token", res.data.tokens.refresh);
      sessionStorage.setItem("todoist_user", JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login(username, password) {
    const res = await api.post("/auth/login/", { username, password });
    if (res.data.access) {
      sessionStorage.setItem("todoist_access_token", res.data.access);
      sessionStorage.setItem("todoist_refresh_token", res.data.refresh);
      // Fetch user profile
      const userRes = await api.get("/auth/me/");
      sessionStorage.setItem("todoist_user", JSON.stringify(userRes.data));
      return { user: userRes.data, tokens: res.data };
    }
    return res.data;
  },

  async guestLogin() {
    const res = await api.post("/auth/guest/");
    if (res.data.tokens) {
      sessionStorage.setItem("todoist_access_token", res.data.tokens.access);
      sessionStorage.setItem("todoist_refresh_token", res.data.tokens.refresh);
      sessionStorage.setItem("todoist_user", JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getCurrentUser() {
    try {
      const res = await api.get("/auth/me/");
      sessionStorage.setItem("todoist_user", JSON.stringify(res.data));
      return res.data;
    } catch {
      return null;
    }
  },

  getUserFromStorage() {
    const userStr = sessionStorage.getItem("todoist_user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!sessionStorage.getItem("todoist_access_token");
  },

  logout() {
    sessionStorage.removeItem("todoist_access_token");
    sessionStorage.removeItem("todoist_refresh_token");
    sessionStorage.removeItem("todoist_user");
    localStorage.removeItem("todoist_access_token");
    localStorage.removeItem("todoist_refresh_token");
    localStorage.removeItem("todoist_user");
  },
};
