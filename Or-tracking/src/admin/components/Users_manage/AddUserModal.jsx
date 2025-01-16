import React from "react";
import { Modal, Form, Input, Button, Row, Col, notification } from "antd";
import { Icon } from "@iconify/react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

function AddUserModal({ visible, onClose }) {
  const { user } = useAuth();

  const handleFinish = async (values) => {
    try {
      console.log("values: ", { ...values, created_by: user.id });

      const token = localStorage.getItem("jwtToken");
      const response = await axiosInstance.post("/staff", {
        ...values,
        created_by: user.id,
      });

      if (response.status === 200) {
        notification.success({
          message: "Success",
          description: "User details have been saved successfully.",
        });
        onClose(); // ปิด modal
      }
    } catch (error) {
      console.error("Error saving user details:", error);
      notification.error({
        message: "Error",
        description: "Failed to save user details. Please try again.",
      });
    }
  };

  return (
    <Modal
      title={
        <div className="flex flex-col items-center justify-center ">
          <span className="text-2xl font-semibold text-gray-800">
            สร้างบัญชีผู้ใช้
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      className="rounded-lg"
      styles={{
        body: {
          padding: "32px",
          fontSize: "16px",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
        },
      }}
      width={800}
    >
      <Form onFinish={handleFinish} layout="vertical" className="space-y-6">
        <Row gutter={[16, 24]}>
          {/* ฟิลด์ First Name */}
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="text-lg font-medium text-gray-700">ชื่อ</span>
              }
              name="firstname"
              rules={[{ required: true, message: "กรุณากรอกชื่อจริงของคุณ!" }]}
            >
              <Input
                className="p-3 text-base border rounded-lg border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                prefix={
                  <Icon icon="lucide:user" className="mr-2 text-blue-500" />
                }
                placeholder="กรุณากรอกชื่อจริง"
              />
            </Form.Item>
          </Col>
          {/* ฟิลด์ Last Name */}
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="text-lg font-medium text-gray-700">
                  นามสกุล
                </span>
              }
              name="lastname"
              rules={[{ required: true, message: "กรุณากรอกนามสกุลของคุณ!" }]}
            >
              <Input
                className="p-3 text-base border rounded-lg border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                prefix={
                  <Icon icon="lucide:user" className="mr-2 text-blue-500" />
                }
                placeholder="กรุณากรอกนามสกุล"
              />
            </Form.Item>
          </Col>
          {/* ฟิลด์ Username */}
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="text-lg font-medium text-gray-700">
                  ชื่อผู้ใช้
                </span>
              }
              name="username"
              rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้!" }]}
            >
              <Input
                className="p-3 text-base border rounded-lg border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                prefix={
                  <Icon icon="lucide:mail" className="mr-2 text-blue-500" />
                }
                placeholder="กรุณากรอกชื่อผู้ใช้"
              />
            </Form.Item>
          </Col>
          {/* ฟิลด์ Password */}
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="text-lg font-medium text-gray-700">
                  รหัสผ่าน
                </span>
              }
              name="password"
              rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน!" }]}
            >
              <Input.Password
                className="p-3 text-base border rounded-lg border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="กรุณากรอกรหัสผ่าน"
              />
            </Form.Item>
          </Col>
        </Row>
        {/* ปุ่ม */}
        <div className="flex justify-center space-x-4 border-t pt-6 mt-6">
          <Button onClick={onClose} className="px-6 py-2 text-lg">
            ยกเลิก
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-lg"
          >
            ยืนยัน
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default AddUserModal;
