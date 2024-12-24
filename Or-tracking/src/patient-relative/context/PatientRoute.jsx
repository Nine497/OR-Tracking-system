import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { notification } from "antd";
import { usePatient } from "./PatientContext";

const PatientRoute = ({ children }) => {
  const navigate = useNavigate();
  const { patient_link } = usePatient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!isLoading) {
          notification.warning({
            message: "Please login to access this page.",
          });
          navigate(`/ptr?link=${patient_link}`, { replace: true });
        }
      }
    };

    if (!isLoading) {
      checkToken();
    }
  }, [navigate, isLoading, patient_link]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return null;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PatientRoute;
