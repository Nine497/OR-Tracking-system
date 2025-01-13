import React, { useState, useEffect } from "react";
import { Modal, Form, Checkbox, Button, notification } from "antd";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";

function PermissionModal({ visible, staff, onClose }) {
  const [allPermissions, setAllPermissions] = useState([]);
  const [staffPermissions, setStaffPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [form] = Form.useForm();

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
        setAllPermissions(response.data.permissions);
        console.log(allPermissions);

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

  const handleFinish = async () => {
    const permissions = staffPermissions.map((p) => p.permission_id);

    if (permissions.length > 0) {
      console.log("Permissions to be updated:", permissions);

      const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss.SSS");

      try {
        const token = localStorage.getItem("jwtToken");

        const response = await axiosInstance.post(
          `/staff/update_permissions/${staff.staff_id}`,
          {
            permission_ids: permissions,
            gived_by: user.id,
            gived_at: currentDateTime,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        notification.success({
          message: "Success",
          description: "Permissions updated successfully!",
        });

        onClose();
      } catch (error) {
        console.error("Error updating permissions:", error);
        notification.error({
          message: "Error",
          description: "Failed to update permissions.",
        });
      }
    } else {
      notification.warning({
        message: "No permissions selected",
        description: "Please select at least one permission to update.",
      });
    }
  };

  useEffect(() => {
    console.log("staffPermissions : ", staffPermissions);
  }, [staffPermissions]);

  const handleCheckboxChange = (value, checked) => {
    console.log("Checkbox value:", value, "Checked:", checked);

    let updatedPermissions = [...staffPermissions];

    if (checked) {
      updatedPermissions.push({ permission_id: value });
    } else {
      updatedPermissions = updatedPermissions.filter(
        (item) => item.permission_id !== value
      );
    }

    setStaffPermissions(updatedPermissions);
  };

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
          valuePropName="value"
          initialValue={staffPermissions.map((p) => p.permission_id)}
        >
          <div className="grid grid-cols-2 gap-6">
            {allPermissions.map((item) => (
              <CustomCheckbox
                key={item.permission_id}
                value={item.permission_id}
                staff={staffPermissions}
                onChange={handleCheckboxChange}
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

const CustomCheckbox = ({ value, label, staff, onChange }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // ตรวจสอบว่า permission_id ของ staff ตรงกับค่า value ที่ได้รับจาก checkbox
    setIsChecked(staff.some((item) => item.permission_id === value));
  }, [staff, value]); // อัปเดตเมื่อ staff หรือ value เปลี่ยนแปลง

  const handleChange = (e) => {
    if (e && e.target) {
      const checked = e.target.checked;
      setIsChecked(checked);
      onChange(value, checked);
    }
  };

  return (
    <Checkbox
      value={value}
      checked={isChecked}
      onChange={handleChange} // เรียกใช้งาน handleChange เมื่อมีการเปลี่ยนแปลง
      className="flex items-center p-3 border rounded-lg hover:bg-blue-50 transition-colors text-base"
    >
      <span className="text-base font-normal">{label}</span>
    </Checkbox>
  );
};

export default PermissionModal;
