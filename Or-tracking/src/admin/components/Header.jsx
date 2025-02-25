import React, { useEffect } from "react";
import BreadcrumbComponent from "../components/Breadcrumb";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { disableCache, Icon } from "@iconify/react";
import { Dropdown, Button, Modal } from "antd";
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

  useEffect(() => {
    if (!user || !user.firstname || !user.lastname) {
      localStorage.removeItem("jwtToken");
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    Modal.confirm({
      title: "คุณแน่ใจไหมว่าต้องการออกจากระบบ?",
      okText: "ออกจากระบบ",
      cancelText: "ยกเลิก",
      centered: true,
      className: "font-sans",
      okButtonProps: {
        className: "bg-red-500 hover:bg-red-600",
      },
      onOk: () => {
        logout();
      },
    });
  };

  const menuItems = [
    {
      key: "profile_setting",
      disabled: true,
      label: (
        <div className="flex items-center px-1 py-1 transition-colors duration-200">
          <Icon icon="weui:setting-outlined" className="w-4 h-4 mr-2" />
          <span className="font-medium">การตั้งค่าบัญชี</span>
        </div>
      ),
      onClick: () => navigate("admin/profile"),
    },
    {
      type: "divider",
      className: "my-1",
    },
    {
      key: "logout",
      label: (
        <div className="flex items-center px-1 py-1 text-red-500 hover:text-red-600 transition-colors duration-200">
          <Icon icon="mdi:logout" className="w-4 h-4 mr-2" />
          <span className="font-medium">ออกจากระบบ</span>
        </div>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown
      menu={{
        items: menuItems,
        className: "w-48 p-1 shadow-lg rounded-xl",
      }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        className="rounded-full bg-white
          flex items-center justify-center gap-2
          border-none shadow-md 
          group hover:text-blue-500
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-0
          px-4 py-2"
      >
        <div>
          <span className="font-medium hidden sm:block">
            {user ? `${user.firstname} ${user.lastname}` : null}
          </span>
        </div>
        <span className="mx-1 text-gray-300">|</span>
        <Icon
          icon="iconoir:user"
          className="text-xl cursor-pointer
            text-gray-700 group-hover:text-blue-500
            transition-colors duration-300 "
        />
      </Button>
    </Dropdown>
  );
};
