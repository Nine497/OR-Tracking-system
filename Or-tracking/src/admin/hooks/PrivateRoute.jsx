import React, { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notification } from "antd";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = () => {
  const { setUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            setUser(decoded);
          } else {
            localStorage.removeItem("jwtToken");
            notification.warning({
              message: "Session expired. Please login again.",
            });
            navigate("/");
          }
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem("jwtToken");
          notification.warning({
            message: "Invalid token. Please login again.",
          });
          navigate("/");
        }
      }
    };

    checkToken();
  }, [setUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Outlet />;
};

export default PrivateRoute;
