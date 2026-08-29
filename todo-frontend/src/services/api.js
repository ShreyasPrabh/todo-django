import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT access token to every request if available
api.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("todoist_access_token") ||
      localStorage.getItem("todoist_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration & refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("auth/")
    ) {
      originalRequest._retry = true;
      const refreshToken =
        sessionStorage.getItem("todoist_refresh_token") ||
        localStorage.getItem("todoist_refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          if (res.data && res.data.access) {
            sessionStorage.setItem("todoist_access_token", res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          // Token refresh failed - clean up
          sessionStorage.removeItem("todoist_access_token");
          sessionStorage.removeItem("todoist_refresh_token");
          sessionStorage.removeItem("todoist_user");
          localStorage.removeItem("todoist_access_token");
          localStorage.removeItem("todoist_refresh_token");
          localStorage.removeItem("todoist_user");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
