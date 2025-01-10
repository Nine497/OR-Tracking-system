import React from "react";
import { Dropdown, Button, Modal, notification } from "antd";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BreadcrumbComponent from "../components/Breadcrumb";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    Modal.confirm({
      title: "Are you sure you want to logout?",
      content: "You will be redirected to the login page.",
      okText: "Logout",
      cancelText: "Cancel",
      centered: true,
      onOk: () => {
        logout();
        notification.success({
          message: "Logout Successful",
          description: "You have been logged out.",
        });
        navigate("/login");
      },
    });
  };

  const menuItems = [
    {
      key: "profile",
      label: (
        <div
          onClick={() => navigate("/profile")}
          className="text-base flex items-center space-x-2 "
        >
          <Icon icon="mdi:account-circle" className="text-lg" />
          <span className="font-medium">Profile Settings</span>
        </div>
      ),
    },
    {
      key: "logout",
      label: (
        <div
          onClick={handleLogout}
          className="text-base flex items-center space-x-2 text-red-600"
        >
          <Icon icon="mdi:logout" className="text-lg" />
          <span className="font-medium">Logout</span>
        </div>
      ),
    },
  ];

  const firstLetter = user ? user.username.charAt(0).toUpperCase() : "A";

  return (
    <div className="text-gray-700 flex justify-between items-center px-10 pt-2 bg-gray-200">
      <div className="flex items-center space-x-4 pl-4 lg:pl-0">
        <BreadcrumbComponent />
      </div>
      <div className="flex items-center space-x-4">
        <div className="mr-4 text-gray-500 flex items-center space-x-2"></div>
        <Dropdown
          menu={{
            items: menuItems,
            className: "w-48",
          }}
          trigger={["click"]}
        >
          <Button className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-2 border-blue-100">
            <span className="font-bold text-xl">{firstLetter}</span>
          </Button>
        </Dropdown>
      </div>
    </div>
  );
}

export default Header;
