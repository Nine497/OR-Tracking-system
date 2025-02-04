import axios from "axios";
import { Modal } from "antd";
import { PatientProvider } from "../../patient-relative/context/PatientContext";

const patient_link = PatientProvider.patient_link;
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

      if (status === 403) {
        Modal.error({
          title: "บัญชีถูกระงับ",
          content: "บัญชีของคุณถูกระงับ กรุณาเข้าสู่ระบบอีกครั้ง.",
          okText: "ไปยังหน้าล็อกอิน",
          onOk: () => {
            localStorage.removeItem("jwtToken");
            window.location.href = "/login";
          },
          keyboard: false,
          closable: false,
        });
      } else if (status === 401) {
        Modal.error({
          title: "เซสชันหมดอายุ",
          content: "เซสชันของคุณหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง.",
          okText: "ไปยังหน้าล็อกอิน",
          onOk: () => {
            localStorage.removeItem("jwtToken");
            window.location.href = "/login";
          },
          keyboard: false,
          closable: false,
        });
      }
    }

    return Promise.reject(error);
  }
);

axiosInstancePatient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstancePatient.interceptors.response.use(
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
            localStorage.removeItem("token");
            window.location.href = `/ptr?link=${patient_link}`;
          },
        });
      } else if (status === 401) {
        Modal.error({
          title: "เซสชันหมดอายุ",
          content: "เซสชันของคุณหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง.",
          okText: "ไปยังหน้าล็อกอิน",
          onOk: () => {
            localStorage.removeItem("token");
            console.log("patient_link", patient_link);
            window.location.href = `/ptr?link=${patient_link}`;
          },
        });
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstanceStaff, axiosInstancePatient };
