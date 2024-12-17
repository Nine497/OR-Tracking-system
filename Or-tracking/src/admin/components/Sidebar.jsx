// Sidebar.jsx
import React, { useEffect, useState } from "react";
import { Layout, Menu, Button } from "antd";
import { useLocation, NavLink } from "react-router-dom";
import {
  HomeOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import Logo from "../assets/Logo.png";
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

const Sidebar = ({ collapsed, setCollapsed, isMobile, user }) => {
  const location = useLocation();
  const [userPermissions, setUserPermissions] = useState([]);
  const selectedKey = items.find((item) =>
    location.pathname.startsWith(item.to)
  )?.key;

  useEffect(() => {
    const fetchPermissions = async () => {
      if (user?.id) {
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
        }
      }
    };

    fetchPermissions();
    const fetchPermissionsInterval = setInterval(fetchPermissions, 300000);
    return () => clearInterval(fetchPermissionsInterval);
  }, [user?.id]);

  const menuItems = items
    .map((item) => {
      const hasPermission =
        !item.permissionRequired ||
        (Array.isArray(userPermissions) &&
          userPermissions.includes(item.permissionRequired));

      if (item.permissionRequired && !hasPermission) return null;

      return {
        key: item.key,
        icon: <span>{item.icon}</span>,
        label: <NavLink to={item.to}>{item.label}</NavLink>,
      };
    })
    .filter(Boolean);

  return (
    <Layout.Sider
      theme="light"
      collapsed={collapsed}
      onCollapse={setCollapsed}
      collapsible
      collapsedWidth={isMobile ? 0 : 80}
      width={240}
      className="fixed left-0 top-0 bottom-0 h-screen z-20 shadow-lg border-r border-gray-100"
      trigger={
        !isMobile && (
          <CustomTrigger collapsed={collapsed} setCollapsed={setCollapsed} />
        )
      }
    >
      {isMobile && (
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-12 top-4 shadow-md bg-white"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "4px",
          }}
        />
      )}

      <div className="flex items-center justify-center p-4 h-16 border-b border-gray-100">
        <img
          src={Logo}
          alt="Logo"
          className={`transition-all duration-300 ${
            collapsed ? "w-12" : "w-32"
          } h-auto object-contain`}
        />
      </div>

      <Menu
        mode="inline"
        theme="light"
        selectedKeys={[selectedKey]}
        items={menuItems}
        className="border-none custom-sidebar-menu bg-transparent [&_.ant-menu-item]:text-base [&_.ant-menu-item_.anticon]:text-xl [&_.ant-menu-item]:py-6"
      />

      <div
        className={`
            absolute bottom-7 w-full p-4 border-t border-gray-100 text-center
            transition-all duration-300 bg-white
            ${collapsed ? "opacity-0" : "opacity-100"}
          `}
      >
        <p className="text-sm text-gray-600 font-bold">OR-Tracking System</p>
        <p className="text-sm text-gray-600">Version 0.0.1</p>
      </div>
    </Layout.Sider>
  );
};

const CustomTrigger = ({ collapsed, setCollapsed }) => (
  <div
    onClick={() => setCollapsed(!collapsed)}
    className="absolute -right-6 top-20  bg-white rounded-r-lg border-y border-r border-gray-200 cursor-pointerhover:bg-gray-50 
      transition-colors 
      duration-200 
      flex 
      items-center 
      justify-center 
      w-6 
      h-12 
      shadow-md"
  >
    {collapsed ? (
      <RightOutlined className="text-xs text-gray-600" />
    ) : (
      <LeftOutlined className="text-xs text-gray-600" />
    )}
  </div>
);

export default Sidebar;
