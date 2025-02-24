import React from "react";
import { Modal, Form, Input, Button, Row, Col, notification, Card } from "antd";
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

            handleClose();
          }
        } catch (error) {
          console.error("Error in handleFinish:", error);
          notification.warning({
            message:
              error?.status === 409
                ? "ชื่อผู้ใช้นี้มีอยู่แล้ว โปรดใช้ชื่อผู้ใช้อื่น"
                : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
            placement: "topRight",
            duration: 2,
          });
        }
      },
    });
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
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
        },
      }}
      width={800}
    >
      <Form onFinish={handleFinish} layout="vertical" className="space-y-4">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="text-base font-semibold text-gray-700">
                  ชื่อ
                </span>
              }
              name="firstname"
              rules={[
                { required: true, message: "กรุณากรอกชื่อจริงของคุณ!" },
                { pattern: /^[^\d]+$/, message: "ห้ามมีตัวเลขในชื่อ!" },
              ]}
            >
              <Input
                className="h-11 text-base rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="กรุณากรอกชื่อจริง"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="text-base font-semibold text-gray-700">
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
                className="h-11 text-base rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="กรุณากรอกนามสกุล"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-700">
                    ชื่อผู้ใช้
                  </span>
                  <span className="text-sm text-gray-500">(ห้ามซ้ำ)</span>
                </div>
              }
              name="username"
              rules={[
                { required: true, message: "กรุณากรอกชื่อผู้ใช้!" },
                {
                  pattern: /^\S+$/,
                  message: "ห้ามมีช่องว่างในชื่อผู้ใช้!",
                },
              ]}
            >
              <Input
                className="h-11 text-base rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="กรุณากรอกชื่อผู้ใช้"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="text-base font-semibold text-gray-700">
                  รหัสผ่าน
                </span>
              }
              name="password"
              rules={[
                { required: true, message: "กรุณากรอกรหัสผ่าน!" },
                { min: 8, message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร!" },
              ]}
            >
              <Input.Password
                className="h-11 text-base rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="กรุณากรอกรหัสผ่าน"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="text-base font-semibold text-gray-700">
                  ยืนยันรหัสผ่าน
                </span>
              }
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "กรุณากรอกยืนยันรหัสผ่าน!" },
                { min: 8, message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("รหัสผ่านไม่ตรงกัน!"));
                  },
                }),
              ]}
            >
              <Input.Password
                className="h-11 text-base rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="กรุณากรอกรหัสผ่านอีกครั้ง"
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-center gap-4 pt-6 mt-6 border-t border-gray-300">
          <Button
            onClick={handleClose}
            className="min-w-[120px] h-11 text-base rounded-lg bg-gray-200 hover:bg-gray-300 shadow-sm transition-all flex items-center gap-2"
          >
            <Icon icon="mdi:cancel" width="20" /> ยกเลิก
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="min-w-[120px] h-11 text-base bg-blue-600 hover:bg-blue-700 shadow-md text-white rounded-lg transition-all flex items-center gap-2"
          >
            <Icon icon="mdi:check-circle" width="20" /> ยืนยัน
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default AddUserModal;
