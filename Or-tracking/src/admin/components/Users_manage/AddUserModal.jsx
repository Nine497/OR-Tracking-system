import React from "react";
import { Modal, Form, Input, Button, Row, Col, notification } from "antd";
import { Icon } from "@iconify/react";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

function AddUserModal({ visible, onClose }) {
  const { user } = useAuth();

  const handleFinish = async (values) => {
    Modal.confirm({
      title: "ยืนยันการบันทึกข้อมูล",
      content: "คุณแน่ใจหรือไม่ว่าต้องการบันทึกข้อมูลนี้?",
      okText: "ยืนยัน",
      cancelText: "ยกเลิก",
      centered: true,
      onOk: async () => {
        try {
          const response = await axiosInstanceStaff.post("/staff", {
            ...values,
            created_by: user.id,
          });

          if (response?.status === 201) {
            notification.success({
              message: "บันทึกข้อมูลสำเร็จ",
              description: "ข้อมูลผู้ใช้ถูกบันทึกแล้ว",
              placement: "topRight",
              duration: 2,
            });

            fetchData();
            onClose();
          }
        } catch (error) {
          const status = error.response?.status;

          notification.error({
            message:
              status === 409
                ? "ชื่อผู้ใช้นี้มีอยู่แล้ว โปรดใช้ชื่อผู้ใช้อื่น"
                : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
            placement: "topRight",
            duration: 2,
          });
        }
      },
    });
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
              rules={[
                { required: true, message: "กรุณากรอกชื่อผู้ใช้!" },
                { pattern: /^\S+$/, message: "ห้ามมีช่องว่างในชื่อผู้ใช้!" },
              ]}
            >
              <Input
                className="p-3 text-base border rounded-lg border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
