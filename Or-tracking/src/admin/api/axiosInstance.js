import axios from "axios";
console.log(import.meta.env.VITE_BASE_API_URL);

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL || "http://localhost:3000/api/",
  timeout: 15000,
});

export default axiosInstance;
