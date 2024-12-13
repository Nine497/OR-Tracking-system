import React, { useEffect, useState } from "react";
import { Menu } from "antd";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { HomeOutlined, CalendarOutlined, UsergroupAddOutlined, FileTextOutlined } from "@ant-design/icons";
import Logo from "../assets/Logo.png";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

const items = [
  {
    label: "OR-Room",
    to: "/admin/room_schedule",
    icon: <HomeOutlined />,
    key: "room_schedule",
  },
  {
    label: "Calendar",
    to: "/admin/calendar",
    icon: <CalendarOutlined />,
    key: "calendar",
  },
  {
    label: "Users",
    to: "/admin/users_manage",
    icon: <UsergroupAddOutlined />,
    key: "users_manage",
    permissionRequired: 5002,
  },
  {
    label: "Case",
    to: "/admin/case_manage",
    icon: <FileTextOutlined />,
    key: "case_manage",
    permissionRequired: 5004,
  },
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userPermissions, setUserPermissions] = useState([]);
  const selectedKey = items.find((item) => location.pathname.startsWith(item.to))?.key;

  useEffect(() => {
    const fetchPermissions = async () => {
      if (user && user.id) {
        try {
          const token = localStorage.getItem("jwtToken");

          const response = await axiosInstance.get(`/staff/permissions/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const permissions = response.data.map((item) => item.permission_id);
          setUserPermissions(permissions);
          console.log("Permissions received:", permissions);
        } catch (error) {
          console.error("Error fetching permissions:", error);
        }
      }
    };


    if (user && user.id) {
      fetchPermissions();
    }
  }, [user]);

  useEffect(() => {
    const currentItem = items.find((item) => location.pathname.startsWith(item.to));
    if (currentItem && currentItem.permissionRequired && !userPermissions.includes(currentItem.permissionRequired)) {
      navigate("/admin/room_schedule");
    }
  }, [userPermissions, location, navigate]);

  const menuItems = items
    .map((item) => {
      const hasPermission =
        !item.permissionRequired || (Array.isArray(userPermissions) && userPermissions.includes(item.permissionRequired));

      if (item.permissionRequired && !hasPermission) return null;

      return {
        key: item.key,
        icon: item.icon,
        label: (
          <div className={`py-2 px-4 rounded-md`}>
            <NavLink to={item.to}>{item.label}</NavLink>
          </div>
        ),
      };
    })
    .filter(Boolean);

  return (
    <div className="flex flex-col h-screen bg-white shadow-md w-64">
      <div className="flex items-center justify-center py-6 border-b border-gray-200">
        <img src={Logo} alt="Logo" className="w-40 h-auto object-contain" />
      </div>
      <Menu
        mode="inline"
        theme="light"
        selectedKeys={[selectedKey]}
        className="flex-grow p-1"
        items={menuItems}
        style={{ backgroundColor: "transparent", border: "none" }}
      />
      <div className="p-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600 font-bold">OR-Tracking System</p>
        <p className="text-sm text-gray-600 font-normal">Version 0.0.1</p>
      </div>
    </div>
  );
};

export default Sidebar;
