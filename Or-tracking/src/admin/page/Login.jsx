// Login.js
import React from "react";
import { Form, Input, Button, Card, notification } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import LoginImg from "../assets/Login.jpg";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form] = Form.useForm();
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const result = await login(values);
      if (result.success) {
        notification.success({
          message: "Login successful",
          description: "Welcome back!",
        });
        navigate("/admin/room_schedule");
      } else {
        throw new Error(result.error || "Invalid credentials.");
      }
    } catch (error) {
      notification.error({
        message: "Login failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-[7]">
        <img
          src={LoginImg}
          alt="Login Illustration"
          className="w-full h-full object-cover filter brightness-75"
        />
      </div>
      <div className="flex-[3] flex justify-center items-center bg-white">
        <Card className="w-full max-w-md rounded-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">
              OR-Tracking
            </h1>
            <h2 className="text-2xl font-semibold">Log in</h2>
          </div>
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className="space-y-4"
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
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
