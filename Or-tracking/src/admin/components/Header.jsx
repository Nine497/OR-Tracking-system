import React, { useState } from "react";
import { Dropdown, Menu, Button, Modal, notification } from "antd";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BreadcrumbComponent from "../components/Breadcrumb";

function Header() {
  return (
    <div className="text-gray-700 flex justify-between items-center px-10 py-2 bg-gray-200">
      <div className="flex items-center space-x-4 lg:pl-0">
        <BreadcrumbComponent />
      </div>
      <div className="flex items-center space-x-4">
        <StyledDropdown />
      </div>
    </div>
  );
}

export default Header;

const StyledDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    Modal.confirm({
      title: "คุณแน่ใจไหมว่าต้องการออกจากระบบ?",
      okText: "ออกจากระบบ",
      cancelText: "ยกเลิก",
      centered: true,
      onOk: () => {
        logout();
        notification.success({
          message: "ออกจากระบบแล้ว",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
        navigate("/login");
      },
    });
  };

  const menu = (
    <Menu>
      {/* แสดงชื่อและนามสกุล */}
      <Menu.Item key="user_info" disabled>
        <span className="text-gray-700 font-medium text-base">
          {`${user.firstname} ${user.lastname}`}
        </span>
      </Menu.Item>
      <Menu.Divider />

      {/* ตัวเลือกสำหรับ Profile Setting */}
      <Menu.Item
        key="profile_setting"
        onClick={() => navigate("/profile")}
        icon={<Icon icon="weui:setting-outlined" className="text-xl" />}
      >
        <span className="text-sm font-normal">Account Setting</span>
      </Menu.Item>

      <Menu.Divider />

      {/* ตัวเลือกสำหรับ Logout */}
      <Menu.Item
        key="logout"
        onClick={handleLogout}
        icon={<Icon icon="mdi:logout" className="text-xl" />}
      >
        <span className="text-sm font-normal">Logout</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
      <Button
        className=" rounded-full bg-white
               flex items-center justify-center 
                border-none shadow-md 
               transition-all duration-300 ease-out 
               "
      >
        <Icon icon="line-md:menu" className="text-black text-lg" />
      </Button>
    </Dropdown>
  );
};
