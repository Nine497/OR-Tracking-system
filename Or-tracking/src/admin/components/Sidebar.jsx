import React, { useEffect, useState } from "react";
import { Menu, Spin } from "antd";
import { useLocation, NavLink } from "react-router-dom";
import {
  HomeOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import Logo from "../assets/Logo.png";
import { checkPermission } from "../lib/checkPermission";

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

const Sidebar = ({ authUser }) => {
  const location = useLocation();
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedKey = items.find((item) =>
    location.pathname.startsWith(`/admin/${item.key}`)
  )?.key;

  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true);
      try {
        const permissions = await Promise.all(
          items.map(async (item) => {
            const hasPermission = item.permissionRequired
              ? await checkPermission(
                  authUser.staff_id,
                  item.permissionRequired
                )
              : true;
            return { key: item.key, hasPermission };
          })
        );
        setUserPermissions(permissions);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      } finally {
        setLoading(false);
      }
    };
    if (authUser?.staff_id) fetchPermissions();
  }, [authUser]);

  const menuItems = items
    .map((item) => {
      const isSelected = selectedKey === item.key;
      const permission = userPermissions.find((perm) => perm.key === item.key);

      if (item.permissionRequired && !permission?.hasPermission) return null;

      return {
        key: item.key,
        icon: item.icon,
        label: (
          <div
            className={`py-2 px-4 rounded-md transition-colors duration-200 ${
              isSelected ? "text-blue-700 font-semibold" : "hover:bg-gray-100"
            }`}
          >
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
      {loading ? (
        <div className="flex justify-center items-center flex-grow">
          <Spin size="large" />
        </div>
      ) : (
        <Menu
          mode="inline"
          theme="light"
          selectedKeys={[selectedKey]}
          className="flex-grow p-1"
          items={menuItems}
          style={{ backgroundColor: "transparent", border: "none" }}
        />
      )}
      <div className="p-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600 font-bold">OR-Tracking System</p>
        <p className="text-sm text-gray-600 font-normal">Version 0.0.1</p>
      </div>
    </div>
  );
};

export default Sidebar;
