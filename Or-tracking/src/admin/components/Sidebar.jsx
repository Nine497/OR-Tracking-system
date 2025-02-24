import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import { useLocation, NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/Logo.png";

const { Sider } = Layout;

const items = [
  {
    label: "ห้องผ่าตัด",
    to: "/admin/room_schedule",
    icon: <Icon icon="ic:baseline-home" className="text-lg" />,
    key: "room_schedule",
  },
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
    permissionRequired: "20",
  },
  {
    label: "ผู้ใช้",
    to: "/admin/users_manage",
    icon: <Icon icon="ic:baseline-group-add" className="text-lg" />,
    key: "users_manage",
    permissionRequired: "10",
  },
];

const Sidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const location = useLocation();
  const [userPermissions, setUserPermissions] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { permissions } = useAuth();

  const selectedKey = items.find((item) =>
    location.pathname.startsWith(item.to)
  )?.key;

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

  const MainMenu = () => (
    <Menu
      mode="inline"
      theme="light"
      selectedKeys={[selectedKey]}
      items={menuItems}
      className="border-none bg-transparent"
      onClick={() => isMobile && setDrawerVisible(false)}
    />
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <Sider
      theme="light"
      collapsed={collapsed}
      onCollapse={setCollapsed}
      collapsible
      collapsedWidth={80}
      width={240}
      className="hidden md:block fixed left-0 top-0 h-screen shadow-lg border-r border-gray-200"
      trigger={null}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className={`h-16 w-full flex items-center justify-between ${
            collapsed ? "pl-1 pr-1" : "pl-7 pr-2"
          }  border-b border-gray-100`}
        >
          {/* โลโก้ */}
          <img
            src={Logo}
            alt="Logo"
            className={`transition-all duration-300 ease-in-out flex-1 min-w-10 max-w-32 ${
              collapsed ? "w-10" : "w-32"
            } h-auto object-contain`}
          />

          {/* ปุ่ม */}
          <Button
            type="text"
            icon={
              collapsed ? (
                <Icon
                  icon="mdi:arrow-expand-right"
                  className="text-base border-none"
                />
              ) : (
                <Icon
                  icon="mdi:arrow-collapse-left"
                  className="text-base border-none"
                />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-gray-50  text-right"
          />
        </div>

        {/* Menu */}
        <MainMenu />

        {/* Footer */}
        <div
          className={`min-h-[4rem] w-full px-4 py-3 mt-auto border-t border-gray-200 
            text-center bg-gray-50 transition-all duration-300 
            ${collapsed ? "opacity-0" : "opacity-100"}`}
        >
          <p className="text-sm font-semibold text-gray-700 mb-0.5">
            OR-Tracking System
          </p>
          <p className="text-xs text-gray-500">Version 1.0.1</p>
        </div>
      </div>
    </Sider>
  );

  // Mobile Header with Hamburger
  const MobileHeader = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white z-20 flex items-center justify-between px-4 border-b border-gray-200 shadow-sm">
      <img src={Logo} alt="Logo" className="h-8 w-auto" />
      <Button
        type="text"
        icon={<Icon icon="mdi:menu" className="text-xl" />}
        onClick={() => setDrawerVisible(true)}
        className="flex items-center justify-center hover:bg-gray-50"
      />
    </div>
  );

  const MobileDrawer = () => (
    <Drawer
      title={
        <div className="flex items-center space-x-3">
          <img src={Logo} alt="Logo" className="h-8 w-auto" />
        </div>
      }
      placement="left"
      onClose={() => setDrawerVisible(false)}
      open={drawerVisible}
      width={200}
      className="md:hidden"
      bodyStyle={{ padding: 0 }}
      closable={false}
    >
      <MainMenu />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-center bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-500">Version 0.0.1</p>
      </div>
    </Drawer>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileHeader />
      <MobileDrawer />
    </>
  );
};

export default Sidebar;
