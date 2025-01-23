import axios from "axios";
import { Modal } from "antd";

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
  (error) => Promise.reject(error)
);

axiosInstanceStaff.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      console.log("Response Status:", status);
      console.log("Response Data:", data);

      if (status === 301) {
        Modal.error({
          title: "บัญชีถูกระงับ",
          content: "บัญชีของคุณถูกระงับ กรุณาเข้าสู่ระบบอีกครั้ง.",
          okText: "ไปยังหน้าล็อกอิน",
          onOk: () => {
            localStorage.removeItem("jwtToken");
            window.location.href = "/login";
          },
        });
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstanceStaff, axiosInstancePatient };
