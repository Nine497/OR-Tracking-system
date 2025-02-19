import React from "react";
import { Modal, Form, Input, Button, Row, Col, notification } from "antd";
import { Icon } from "@iconify/react";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

function AddUserModal({ visible, onClose }) {
  const { user } = useAuth();
  const [form] = Form.useForm();

  const formatName = (str) => {
    return str
      .replace(/^\s+|\s+$/g, "")
      .replace(/\b[a-z]/g, (char) => char.toUpperCase());
  };

  const handleFinish = async (values) => {
    Modal.confirm({
      title: "ยืนยันการบันทึกข้อมูล",
      content: "คุณแน่ใจหรือไม่ว่าต้องการบันทึกข้อมูลนี้?",
      okText: "ยืนยัน",
      cancelText: "ยกเลิก",
      centered: true,
      onOk: async () => {
        try {
          const trimmedValues = Object.fromEntries(
            Object.entries(values).map(([key, value]) => {
              if (typeof value === "string") {
                let formattedValue = value.trim();
                if (key === "firstname" || key === "lastname") {
                  formattedValue = formatName(formattedValue);
                }
                return [key, formattedValue];
              }
              return [key, value];
            })
          );

          const response = await axiosInstanceStaff.post("/staff", {
            ...trimmedValues,
            created_by: user.id,
          });

          if (response?.status === 201) {
            notification.success({
              message: "บันทึกข้อมูลสำเร็จ",
              description: "ข้อมูลผู้ใช้ถูกบันทึกแล้ว",
              placement: "topRight",
              duration: 2,
            });

            form.resetFields();
            onClose();
          } else {
            notification.error({
              message:
                response?.status === 409
                  ? "ชื่อผู้ใช้นี้มีอยู่แล้ว โปรดใช้ชื่อผู้ใช้อื่น"
                  : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
              placement: "topRight",
              duration: 2,
            });
          }
        } catch (error) {
          console.error("Error in handleFinish:", error);
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
              rules={[
                { required: true, message: "กรุณากรอกชื่อจริงของคุณ!" },
                { pattern: /^[^\d]+$/, message: "ห้ามมีตัวเลขในชื่อ!" },
              ]}
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
              rules={[
                { required: true, message: "กรุณากรอกนามสกุลของคุณ!" },
                { pattern: /^[^\d]+$/, message: "ห้ามมีตัวเลขในนามสกุล!" },
              ]}
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
                <div className="flex flex-row items-baseline">
                  <span className="text-lg font-medium text-gray-700">
                    ชื่อผู้ใช้
                  </span>
                  <span className="text-sm font-medium text-gray-400 ml-1">
                    (ห้ามซ้ำ)
                  </span>
                </div>
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
