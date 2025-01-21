import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { Spin, notification } from "antd";

const PrivateRoute = () => {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // เช็คว่า loading เสร็จหรือยัง และ user ยังไม่ถูกตั้งค่า
    if (!loading && !user) {
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
                message: "Session ของคุณหมดอายุ กรุณาล็อกอินอีกครั้ง",
                placement: "topRight",
                duration: 2,
              });
              navigate("/");
            }
          } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("jwtToken");
            notification.error({
              message: "Token ของคุณไม่ถูกต้อง กรุณาล็อกอินอีกครั้ง",
              placement: "topRight",
              duration: 2,
            });
            navigate("/");
          }
        } else {
          navigate("/");
        }
      };

      checkToken();
    }
  }, [loading, user, setUser, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin spinning={loading} size="large" />
      </div>
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
