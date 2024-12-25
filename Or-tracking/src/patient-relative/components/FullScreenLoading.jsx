import React, { useState, useEffect } from "react";
import { Progress } from "antd";
import Logo from "../assets/Logo.png";

const FullScreenLoading = ({ isLoading, t }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let interval;

    if (isLoading) {
      interval = setInterval(() => {
        setPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 4;
        });
      }, 50);
    } else {
      setPercent(0);
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="inset-0 bg-gradient-to-b from-white via-blue-50 to-white z-50">
      <div className="flex flex-col items-center justify-center min-h-screen gap-2 p-4">
        <div className="relative">
          <img
            src={Logo}
            alt="Hospital Logo"
            className="w-32 h-32 object-contain"
          />
        </div>
        <div className="w-2/3 px-4 sm:w-1/3">
          <Progress
            percent={percent}
            status="active"
            strokeColor="#4096ff"
            showInfo={false}
          />
        </div>
        <div className="text-center space-y-3">
          <div className="text-blue-600 text-xl font-semibold animate-pulse">
            Loading...
          </div>
          <div className="text-blue-900/60 text-sm font-medium">
            Please wait while we process your request
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-75" />
        <div className="w-3 h-3 bg-blue-500 rounded-full" />
      </div>
    </div>
  );
};

export default FullScreenLoading;
