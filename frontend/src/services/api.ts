import axios from "axios";
import keycloak from "../auth/keycloak";

const api = axios.create({
  baseURL: "http://localhost:8222",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (keycloak.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }

  return config;
});

export default api;