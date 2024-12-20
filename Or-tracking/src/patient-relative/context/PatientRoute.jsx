import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { notification } from "antd";
import { jwtDecode } from "jwt-decode";
import { Spin } from "antd";
import { usePatient } from "./PatientContext";

const PatientRoute = ({ children }) => {
  const navigate = useNavigate();
  const { setPatient } = usePatient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log("Decoded:", decoded);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            setPatient(decoded.patient_id);
            setLoading(false);
          } else {
            localStorage.removeItem("token");
            notification.warning({
              message: "Session expired. Please login again.",
            });
            navigate("/ptr/", { replace: true });
          }
        } catch (error) {
          console.error("Invalid token:", error);
          localStorage.removeItem("token");
          notification.warning({
            message: "Invalid token. Please login again.",
          });
          navigate("/ptr/", { replace: true });
        }
      } else {
        navigate("/ptr/", { replace: true });
      }
    };

    checkToken();
  }, [navigate, setPatient]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin spinning={loading} size="large" />
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PatientRoute;
