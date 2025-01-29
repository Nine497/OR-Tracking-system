import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { axiosInstanceStaff } from "../api/axiosInstance";
import { notification } from "antd";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        console.log("Decoded User:", decodedUser);
        setUser(decodedUser);
        fetchPermissions(decodedUser.id);
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("jwtToken");
      }
    }
    setLoading(false);
  }, []);

  const fetchPermissions = async (userId) => {
    try {
      const response = await axiosInstanceStaff.get(
        `staff/permissions/${userId}`
      );
      const fetchedPermissions = response.data.map(
        (item) => item.permission_id
      );
      setPermissions(fetchedPermissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      if (error.response?.data?.message === "Invalid token") {
        logout();
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    try {
      const decodedUser = jwtDecode(token);
      console.log("Decoded User:", decodedUser);
      setUser(decodedUser);
      localStorage.setItem("jwtToken", token);
      fetchPermissions(decodedUser.id);
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  };

  const logout = () => {
    setUser(null);
    setPermissions([]);
    localStorage.removeItem("jwtToken");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, permissions, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
