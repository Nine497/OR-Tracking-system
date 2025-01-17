import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("jwtToken");
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    const decodedUser = jwtDecode(token);
    console.log("decodedUser", decodedUser);
    setUser(decodedUser);
    localStorage.setItem("jwtToken", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("jwtToken");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
