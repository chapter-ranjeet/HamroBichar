import axios from "axios";
import { getApiBaseUrl } from "./runtime";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ?? error?.message ?? "Unexpected API error";
    return Promise.reject(new Error(message));
  }
);

export default api;
