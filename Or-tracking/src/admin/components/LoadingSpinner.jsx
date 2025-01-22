import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import { Icon } from "@iconify/react";

const LoadingSpinner = () => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots === ".....") {
          return ".";
        }
        return prevDots + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[400px] w-full">
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100/50 rounded-full animate-ping"></div>
            <Spin
              size="large"
              indicator={
                <Icon
                  icon="line-md:loading-twotone-loop"
                  className="text-blue-600 w-12 h-12 animate-spin transform transition-transform duration-500 hover:scale-125"
                />
              }
            />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-gray-700 text-lg animate-pulse hover:scale-105 transition-transform duration-300">
              กำลังโหลดข้อมูล{dots}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
