import React, { useState, useEffect } from "react";
import { Modal, Form, Checkbox, Button, notification } from "antd";
import axiosInstance from "../../api/axiosInstance";

function PermissionModal({ visible, staff, onClose }) {
  const [permissions, setPermissions] = useState([]);
  const [staffPermissions, setStaffPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!visible) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("jwtToken");

        const response = await axiosInstance.get("staff/permissions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPermissions(response.data.permissions);

        console.log(staff);

        if (staff) {
          const staffResponse = await axiosInstance.get(
            `staff/permissions/${staff.staff_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("staffResponse : ", staffResponse);
          setStaffPermissions(staffResponse?.data);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
        notification.error({
          message: "Error fetching permissions",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchPermissions();
    }
  }, [visible, staff]);

  const handleFinish = (values) => {
    console.log("Updated permissions for:", staff.userName, values);
    onClose();
  };

  useEffect(() => {
    console.log("staffPermissions : ", staffPermissions);
  }, [staffPermissions]);

  return (
    <Modal
      title={
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-800">
            Manage Permissions
          </span>
          <span className="mt-1 text-lg font-medium text-blue-600">
            #{staff?.staff_id} - {staff?.firstname} {staff?.lastname}
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      className="rounded-lg"
      width={800}
      confirmLoading={loading}
    >
      <Form onFinish={handleFinish} layout="vertical" className="space-y-6">
        <Form.Item
          name="permissions"
          label={
            <span className="text-lg font-medium text-gray-700">
              Select Permissions
            </span>
          }
        >
          <div className="grid grid-cols-2 gap-6">
            {permissions.map((item) => (
              <CustomCheckbox
                key={item.permission_id}
                value={item.permission_id}
                staff={staffPermissions}
                label={item.permission_name}
              />
            ))}
          </div>
        </Form.Item>
        <div className="flex justify-center space-x-4 border-t pt-6 mt-6">
          <Button onClick={onClose} className="px-6 py-2 text-lg">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-lg"
          >
            Confirm
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

const CustomCheckbox = ({ value, label, staff }) => {
  const [isChecked, setIsChecked] = useState(false);
  useEffect(() => {
    setIsChecked(
      staff.filter((item, i) => item.permission_id === value).length > 0
    );
  }, [staff]);

  return (
    <Checkbox
      checked={isChecked}
      value={value}
      onChange={() => setIsChecked(!isChecked)}
      className="flex items-center p-3 border rounded-lg hover:bg-blue-50 transition-colors text-base"
    >
      <span className="text-base font-normal">{label}</span>
    </Checkbox>
  );
};

export default PermissionModal;
