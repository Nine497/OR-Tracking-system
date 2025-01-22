import axios from "axios";
import { notification } from "antd";

const axiosInstanceStaff = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL || "http://localhost:3000/api/",
  timeout: 15000,
});

const axiosInstancePatient = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL || "http://localhost:3000/api/",
  timeout: 15000,
});

axiosInstanceStaff.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstanceStaff.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (data?.message === "Account is deactivated") {
        notification.error({
          message: "Account is deactivated",
          description:
            "Your account has been deactivated. You will be logged out.",
        });

        localStorage.removeItem("jwtToken");
        window.location.href = "/login";
      }

      if (status === 401) {
        notification.error({
          message: "Unauthorized",
          description:
            "You are not authorized to access this resource. Please log in again.",
        });
        localStorage.removeItem("jwtToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstanceStaff, axiosInstancePatient };
