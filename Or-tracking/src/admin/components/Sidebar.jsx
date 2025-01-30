import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Modal } from "antd";
import { useLocation, NavLink } from "react-router-dom";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import Logo from "../assets/Logo.png";
import { axiosInstanceStaff } from "../api/axiosInstance";

const items = [
  // {
  //   label: "ห้องผ่าตัด",
  //   to: "/admin/room_schedule",
  //   icon: <Icon icon="ic:baseline-home" className="text-lg" />,
  //   key: "room_schedule",
  // },
  {
    label: "ปฏิทิน",
    to: "/admin/calendar",
    icon: <Icon icon="ic:baseline-calendar-today" className="text-lg" />,
    key: "calendar",
  },
  {
    label: "เคสผ่าตัด",
    to: "/admin/case_manage",
    icon: <Icon icon="ic:outline-description" className="text-lg" />,
    key: "case_manage",
    permissionRequired: "5003",
  },
  {
    label: "ผู้ใช้",
    to: "/admin/users_manage",
    icon: <Icon icon="ic:baseline-group-add" className="text-lg" />,
    key: "users_manage",
    permissionRequired: "5002",
  },
];

const Sidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const location = useLocation();
  const [userPermissions, setUserPermissions] = useState([]);
  const selectedKey = items.find((item) =>
    location.pathname.startsWith(item.to)
  )?.key;
  const { permissions } = useAuth();

  useEffect(() => {
    setUserPermissions(permissions);
  }, [permissions]);

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
      collapsible={!isMobile}
      collapsedWidth={isMobile ? 0 : 80}
      width={240}
      className="fixed left-0 top-0 h-screen z-20 shadow-lg border-r border-gray-200 bg-white"
      trigger={null}
    >
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex-none h-16 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4">
          <img
            src={Logo}
            alt="Logo"
            className={`transition-all duration-300 ease-in-out ${
              collapsed ? "w-12 hidden" : "w-32"
            } h-auto object-contain`}
          />
          {!isMobile && (
            <Button
              type="text"
              icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-gray-50 w-8 h-8 p-0 flex items-center justify-center rounded-md focus:outline-none"
            />
          )}
        </div>
        {/* Main Menu */}
        <Menu
          mode="inline"
          theme="light"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="border-none bg-transparent"
        >
          <style jsx>{`
            .ant-menu-item {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 48px;
            }
            .ant-menu-item-active {
              background-color: #e6f7ff;
              color: #1890ff;
            }
            .ant-menu-item-selected {
              background-color: #bae7ff;
              color: #1890ff;
            }
          `}</style>
        </Menu>
        {/* SidebarFooterMenu placed at the bottom */}
        <div className="flex-grow" />
        <SidebarFooterMenu collapsed={collapsed} />
        {/* Footer Section */}
        <div
          className={`flex-none min-h-[4rem] w-full px-4 py-3 mt-auto border-t border-gray-100 text-center bg-white/95 transition-all duration-300 ${
            collapsed ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="text-sm font-semibold text-gray-700 mb-0.5">
            OR-Tracking System
          </p>
          <p className="text-xs text-gray-500">Version 0.0.1</p>
        </div>{" "}
      </div>

      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button
          type="default"
          icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="border-none absolute -right-6 top-4 bg-white hover:bg-gray-50 border-gray-200 w-8 h-8 p-0 flex items-center justify-center rounded-md"
        />
      )}
    </Layout.Sider>
  );
};

const SidebarFooterMenu = ({ collapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    setModalVisible(true);
  };

  const handleOk = () => {
    logout();
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <>
      {/* Footer Menu */}
      <footer className="border-t border-gray-100 bg-white/95">
        <div className="flex flex-col">
          {/* User Info Section - Top */}
          <div
            className={`bg-gray-50 px-4 py-3 border-b border-gray-100 transition-all duration-300 ease-in-out ${
              collapsed ? "px-2 text-center" : "px-4"
            }`}
          >
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-gray-700 font-medium text-base truncate">
                  {`${user.firstname} ${user.lastname}`}
                </span>
                <span className="text-gray-500 text-sm truncate">
                  {user.email || "ผู้ใช้งานระบบ"}
                </span>
              </div>
            )}
            {collapsed && (
              <span className="text-gray-700 font-medium text-base">
                {`${user.firstname.charAt(0)}${user.lastname.charAt(0)}`}
              </span>
            )}
          </div>

          {/* Actions Section - Bottom */}
          <div className="flex flex-col">
            {/* Profile Setting */}
            <button
              onClick={() => navigate("admin/profile")}
              className={`flex items-center transition-all duration-300 space-x-2 py-3 text-sm font-normal bg-white text-gray-700 border-none hover:bg-gray-100 focus:outline-none
                ${collapsed ? "justify-center px-2" : "px-4"}`}
            >
              <Icon
                icon="weui:setting-outlined"
                className={`text-xl ${collapsed ? "mx-auto" : ""}`}
              />
              <span className={collapsed ? "hidden" : "block"}>
                การตั้งค่าบัญชี
              </span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`flex rounded-none
 items-center transition-all duration-300 space-x-2 py-3 text-sm font-normal text-white bg-red-500 border-none hover:bg-red-600 focus:outline-none
                ${collapsed ? "justify-center px-2" : "px-4"}`}
            >
              <Icon
                icon="mdi:logout"
                className={`text-xl ${collapsed ? "mx-auto" : ""}`}
              />
              <span className={collapsed ? "hidden" : "block"}>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modal Confirm */}
      <Modal
        title="คุณแน่ใจไหมว่าต้องการออกจากระบบ?"
        open={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="ออกจากระบบ"
        cancelText="ยกเลิก"
        centered
        okButtonProps={{
          className: "bg-red-500 hover:bg-red-600 border-red-500",
        }}
      />
    </>
  );
};

export default Sidebar;
