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
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                   bg-gradient-to-r from-indigo-50 to-purple-50
                   hover:from-indigo-100 hover:to-purple-100
                   border border-indigo-100/50
                   transition-all duration-300 ease-out
                   focus:outline-none focus:ring-2 focus:ring-purple-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 
                         flex items-center justify-center text-white shadow-sm"
          >
            <Icon icon="carbon:user-profile" width="16" height="16" />
          </div>
          <span
            className="font-medium bg-gradient-to-r from-indigo-600 to-purple-600 
                         bg-clip-text text-transparent"
          >
            {user.username}
          </span>
        </span>
        <svg
          className={`w-4 h-4 text-indigo-500 transition-transform duration-300 ${
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
        <div
          className="absolute right-0 w-48 rounded-xl bg-white shadow-lg 
                      border border-indigo-100/50 z-50
                      backdrop-blur-sm bg-white/95
                      animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Profile Option */}
          <button
            onClick={() => {
              navigate("/profile");
              setIsOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left bg-white
                     hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50
                     flex items-center gap-3 group
                     transition-colors duration-200"
          >
            <div
              className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center
                          group-hover:bg-indigo-200 transition-colors duration-200"
            >
              <Icon
                icon="mdi:account-circle"
                className="w-4 h-4 text-indigo-600"
              />
            </div>
            <span className="text-gray-700 font-medium group-hover:text-indigo-700">
              Profile
            </span>
          </button>

          {/* Divider */}
          <div className="my-1.5 border-t border-indigo-100/50" />

          {/* Logout Option */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left bg-white
                     hover:bg-gradient-to-r hover:from-rose-50 hover:to-red-50
                     flex items-center gap-3 group
                     transition-colors duration-200 hover:border-rose-400 rounded-xl"
          >
            <div
              className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center
                          group-hover:bg-rose-200 transition-colors duration-200"
            >
              <Icon icon="mdi:logout" className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-rose-600 font-medium group-hover:text-rose-700">
              Logout
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
