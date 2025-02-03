import React from "react";
import { Button } from "antd";
import { LockOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function PermissionDenied() {
  const navigate = useNavigate();

  return (
    <div className="w-full p-6 bg-white rounded-lg flex flex-col items-center justify-center pt-[15%]">
      <div className="text-center max-w-lg">
        <div className="mb-6">
          <LockOutlined className="text-6xl text-red-500" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          การเข้าถึงถูกปฏิเสธ
        </h2>
        <p className="text-gray-600 mb-8 font-normal text-lg">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบของคุณ
        </p>

        <div className="flex gap-4 justify-center">
          <Button
            type="primary"
            icon={<HomeOutlined />}
            size="large"
            onClick={() => navigate("/")}
            className="bg-blue-600 font-normal text-lg"
          >
            ไปที่หน้าล็อกอิน
          </Button>
        </div>
      </div>
    </div>
  );
}
