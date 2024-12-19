import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import { Spin } from "antd";

const PermissionRoute = ({ requiredPermission }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get(
          `staff/permissions/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const permissions = response.data.map((item) => item.permission_id);
        setUserPermissions(permissions);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user?.id]);

  const hasPermission = (permissionRequired) => {
    return userPermissions.includes(permissionRequired);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin spinning={loading} size="large" />
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/admin/permissionDenied" />;
  }

  return <Outlet />;
};

export default PermissionRoute;
