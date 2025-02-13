import React, { useState, useEffect } from "react";
import { Form, Input, Button, notification } from "antd";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { axiosInstanceStaff } from "../api/axiosInstance";
import LoginImg from "../assets/Login.webp";
import { Icon } from "@iconify/react";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("jwtToken") || null);

  useEffect(() => {
    if (user && token) {
      if (checkTokenExpiration(token)) {
        navigate("/admin/room_schedule");
      } else {
        notification.error({
          message: "Token หมดอายุ กรุณาเข้าสู่ระบบใหม่",
          placement: "topRight",
          duration: 2,
        });
        navigate("/login");
      }
    }
  }, [user, navigate, token]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { username, password } = values;

      const { data } = await axiosInstanceStaff.post("auth/login", {
        username,
        password,
      });

      if (data.token) {
        login(data.token);
        navigate("/admin/room_schedule");
      }
    } catch (error) {
      console.error("ข้อผิดพลาดในการเข้าสู่ระบบ:", error);

      if (error.response) {
        if (error.response.status === 402) {
          notification.error({
            message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
            showProgress: true,
            placement: "topRight",
            pauseOnHover: true,
            duration: 2,
          });
        } else if (error.response.status === 403) {
          notification.error({
            message: "บัญชีคุณถูกระงับ กรุณาติดต่อผู้ดูแล",
            showProgress: true,
            placement: "topRight",
            pauseOnHover: true,
            duration: 2,
          });
        } else {
          notification.error({
            message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง",
            showProgress: true,
            placement: "topRight",
            pauseOnHover: true,
            duration: 2,
          });
        }
      } else {
        notification.error({
          message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const checkTokenExpiration = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error("Token decode error:", error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left side - Image */}
      {/* <div className="hidden lg:flex lg:w-2/3 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-sm z-10" />
        <img
          srcSet={`${LoginImg}?w=500 500w, ${LoginImg}?w=1000 1000w, ${LoginImg}?w=1500 1500w`}
          sizes="(max-width: 600px) 500px, (max-width: 1200px) 1000px, 1500px"
          alt="Login Illustration"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-20 bg-gradient-to-t from-black/50">
          <h2 className="text-3xl font-bold mb-2">OR-Tracking System</h2>
          <p className="text-lg opacity-90">ระบบจัดการและติดตามการผ่าตัด</p>
        </div>
      </div> */}

      {/* Right side - Login Form */}
      <div className="w-full flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="inline-block p-2 bg-blue-600 rounded-lg mb-4">
              <h1 className="text-3xl font-bold text-white">OR-Tracking</h1>
            </div>

            <p className="mt-2 text-gray-600">
              กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
            </p>
          </div>

          {/* Login Form */}
          <Form onFinish={handleSubmit} layout="vertical" className="space-y-6">
            <Form.Item
              name="username"
              rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
            >
              <Input
                prefix={
                  <Icon icon="solar:user-linear" className="text-gray-400" />
                }
                size="large"
                placeholder="ชื่อผู้ใช้"
                className="rounded-lg h-12"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
            >
              <Input.Password
                prefix={
                  <Icon icon="mdi:password-outline" className="text-gray-400" />
                }
                size="large"
                placeholder="รหัสผ่าน"
                className="rounded-lg h-12"
                autoComplete="current-password"
              />
            </Form.Item>

            {/* <div className="flex items-center justify-between">
              <Form.Item name="remember" valuePropName="checked">
                <a className="text-sm text-blue-600 hover:text-blue-800">
                  ลืมรหัสผ่าน?
                </a>
              </Form.Item>
            </div> */}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                disabled={loading}
                className="h-12 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                icon={<Icon icon="material-symbols:login" />}
              >
                <span className="font-medium text-base">เข้าสู่ระบบ</span>
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
