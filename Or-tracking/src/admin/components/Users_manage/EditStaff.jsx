import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Form, notification } from "antd";
import { axiosInstanceStaff } from "../../api/axiosInstance";

function EditStaffModal({ visible, staff, onClose }) {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatName = (str) => {
    return str
      .replace(/^\s+|\s+$/g, "")
      .replace(/\b[a-z]/g, (char) => char.toUpperCase());
  };

  const handleSave = async () => {
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      notification.error({
        message: "รหัสผ่านไม่ตรงกัน",
        placement: "topRight",
        duration: 2,
      });
      return;
    }

    setLoading(true);
    try {
      await axiosInstanceStaff.patch(`/staff/update/${staff.staff_id}`, {
        firstname: formatName(formData.firstname),
        lastname: formatName(formData.lastname),
        newPassword: formData.newPassword || undefined,
      });

      notification.success({
        message: "อัปเดตข้อมูลสำเร็จ",
        placement: "topRight",
        duration: 2,
      });

      onClose();
    } catch (error) {
      notification.error({
        message: "ไม่สามารถอัปเดตข้อมูลได้",
        placement: "topRight",
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      firstname: staff?.firstname || "",
      lastname: staff?.lastname || "",
      newPassword: null,
      confirmPassword: null,
    }));
  }, [staff]);

  return (
    <Modal
      title={
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-800">
            แก้ไขข้อมูล
          </span>
          <span className="mt-1 text-lg font-medium text-blue-600">
            #{staff?.staff_id} - {staff?.firstname} {staff?.lastname}
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      className="rounded-lg"
      centered
    >
      <Form layout="vertical" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label={
              <span className="ml-1 text-base font-medium text-gray-700">
                ชื่อ
              </span>
            }
            rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
          >
            <Input
              size="large"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="กรอกชื่อ"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="ml-1 text-base font-medium text-gray-700">
                นามสกุล
              </span>
            }
            rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
          >
            <Input
              size="large"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="กรอกนามสกุล"
            />
          </Form.Item>
        </div>
        <Form.Item
          label={
            <span className="ml-1 text-base font-medium text-gray-700">
              รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)
            </span>
          }
        >
          <Input.Password
            size="large"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="กรอกรหัสผ่านใหม่"
          />
        </Form.Item>
        {formData.newPassword ? (
          <Form.Item
            label={
              <span className="ml-1 text-base font-medium text-gray-700">
                ยืนยันรหัสผ่าน
              </span>
            }
          >
            <Input.Password
              size="large"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
            />
          </Form.Item>
        ) : null}
        <div className="flex justify-end">
          <Button
            type="primary"
            size="large"
            onClick={handleSave}
            loading={loading}
          >
            บันทึก
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default EditStaffModal;
