import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { notification } from "antd";

console.log(import.meta.env.VITE_BASE_API_URL);

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL || "http://localhost:3000/api/",
  timeout: 15000,
});

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const expirationTime = decoded.exp * 1000;
    return Date.now() > expirationTime;
  } catch (error) {
    return true;
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");

    if (token) {
      if (isTokenExpired(token)) {
        notification.error({
          message: "Session Expired",
          description: "Your session has expired. Please log in again.",
        });
        localStorage.removeItem("jwtToken");
        window.location.href = "/login";
        return Promise.reject("Token expired");
      }

      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      notification.error({
        message: "Unauthorized",
        description:
          "You are not authorized to access this resource. Please log in again.",
      });
      localStorage.removeItem("jwtToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
