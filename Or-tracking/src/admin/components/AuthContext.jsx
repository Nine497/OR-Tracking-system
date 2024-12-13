import React, { createContext, useState, useEffect, useContext } from "react";
import axiosInstance from "../api/axiosInstance";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

const getStoredToken = () => localStorage.getItem("jwtToken");

const getAuthUser = () => {
  try {
    const token = getStoredToken();
    if (!token) return null;
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 > Date.now()) return decoded;
    return null;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(getAuthUser());
  const [loading, setLoading] = useState(false);

  const login = async ({ username, password }) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/login", {
        username,
        password,
      });
      if (data.token) {
        const permissionsResponse = await axiosInstance.get(
          `/staff/permissions/${data.user.staff_id}`
        );
        const userWithPermissions = {
          ...data.user,
          permissions: permissionsResponse.data.map((p) => p.permission_id),
        };
        setAuthUser(userWithPermissions);
        localStorage.setItem("jwtToken", data.token);
        return { success: true };
      }
      return { success: false, error: "Invalid response from server." };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem("jwtToken");
  };

  useEffect(() => {
    if (!getAuthUser()) logout();
  }, []);

  return (
    <AuthContext.Provider
      value={{ authUser, isAuth: !!authUser, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
