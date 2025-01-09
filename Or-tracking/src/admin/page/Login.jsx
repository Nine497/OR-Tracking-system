import React, { useState } from "react";
import { Form, Input, Button, Card, notification } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import LoginImg from "../assets/Login.jpg";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { username, password } = values;

      const { data } = await axiosInstance.post("auth/login", {
        username,
        password,
      });
      if (data.token) {
        login(data.token);
      }
      notification.success({ message: "Login successful" });
      navigate("/admin/room_schedule");
    } catch (error) {
      console.error("Login error:", error);
      notification.error({
        message: error.response?.data?.message || "Login failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="sm:flex-[7] hidden sm:block">
        <img
          src={LoginImg}
          alt="Login Illustration"
          className="w-full h-full object-cover filter brightness-75"
        />
      </div>

      <div className="flex-[3] flex justify-center items-center bg-white">
        <Card className="w-full max-w-md md:max-w-lg rounded-xl border-none">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">
              OR-Tracking
            </h1>
            <h2 className="text-2xl font-semibold">Log in</h2>
          </div>
          <Form
            onFinish={handleSubmit}
            layout="vertical"
            className="space-y-5 px-7"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please enter your username" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                size="large"
                placeholder="Username"
                autoComplete="username"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                size="large"
                placeholder="Password"
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item className="pt-5">
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                disabled={loading}
              >
                <span className="font-medium">Log in</span>
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
