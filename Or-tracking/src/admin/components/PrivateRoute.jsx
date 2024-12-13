import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { notification } from "antd";
import { checkAuth } from "./AuthContext";

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkAuth()) {
      notification.error({
        message: "Session Expired",
        description: "Your session has expired. Please log in again.",
      });

      navigate("/login");
    }
  }, [navigate]);

  if (!checkAuth()) {
    return null;
  }

  return children;
};

export default PrivateRoute;
