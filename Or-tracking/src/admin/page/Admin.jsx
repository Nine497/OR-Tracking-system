import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { Spin } from "antd";
function Admin() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar user={user} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="sticky top-0 z-10">
          <Header />
        </header>

        <main className="flex-1 px-10 py-5 overflow-auto bg-gray-200">
          <div className="bg-white w-full rounded-lg flex flex-col min-h-[700px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Admin;
