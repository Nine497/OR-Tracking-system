// Admin.jsx
import React, { useEffect, useState } from "react";
import { Layout } from "antd";
import { Outlet, Navigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const { Content } = Layout;

function Admin() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Layout className="h-screen">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        user={user}
      />
      <Layout
        className={`transition-all duration-300 ${
          !isMobile ? (collapsed ? "ml-20" : "ml-60") : "ml-0"
        }`}
      >
        <Header />
        <Content className="p-4 bg-gray-200 overflow-y-auto">
          <div className="bg-white rounded-lg p-3 sm:p-6">
            <Outlet />
          </div>
          <div className="w-full pt-3 h-fit flex justify-center items-center text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Sandbox Lab Center. All rights
              reserved.
            </p>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Admin;
