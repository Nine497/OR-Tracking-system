import React, { useEffect, useRef, useState } from "react";
import { Dropdown, Button, Modal, notification } from "antd";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BreadcrumbComponent from "../components/Breadcrumb";

function Header() {
  return (
    <div className="text-gray-700 flex justify-between items-center px-10 py-2 bg-gray-200">
      <div className="flex items-center space-x-4 pl-4 lg:pl-0">
        <BreadcrumbComponent />
      </div>
      <div className="flex items-center space-x-4">
        <div className="mr-4 text-gray-500 flex items-center space-x-2"></div>
        <StyledDropdown />
      </div>
    </div>
  );
}

export default Header;

const StyledDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 
                   transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-medium">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-gray-700">{user.username}</span>
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 rounded-lg bg-white shadow-lg border border-gray-100 py-1 z-50">
          {/* Profile Option */}
          <button
            onClick={() => {
              navigate("/profile");
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 bg-white text-left hover:bg-gray-200 flex items-center gap-2
                       text-gray-700 transition-colors duration-150 rounded-none border-none"
          >
            <Icon icon="mdi:account-circle" className="w-4 h-4" />
            <span>Profile</span>
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-gray-100" />

          {/* Logout Option */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-white text-left hover:bg-red-100 flex items-center gap-2
                       text-red-600 transition-colors duration-150 rounded-none border-none"
          >
            <Icon icon="mdi:logout" className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};
