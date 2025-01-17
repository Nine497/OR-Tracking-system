import React, { useState, useEffect } from "react";
import { Modal, Form, Checkbox, Button, Spin, notification } from "antd";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";

function PermissionModal({ visible, staff, onClose }) {
  const [allPermissions, setAllPermissions] = useState([]);
  const [staffPermissions, setStaffPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [isFullAccessChecked, setIsFullAccessChecked] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!visible) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get("staff/permissions");

        setAllPermissions(response.data.permissions);
        console.log(response.data.permissions);

        if (staff) {
          const staffResponse = await axiosInstance.get(
            `staff/permissions/${staff.staff_id}`
          );

          setStaffPermissions(staffResponse?.data);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
        notification.error({
          message: "ไม่สามารถดึงข้อมูลสิทธิ์ผู้ใช้ได้",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchPermissions();
    }
  }, [visible, staff]);

  useEffect(() => {
    if (
      allPermissions.length > 0 &&
      staffPermissions.length === allPermissions.length
    ) {
      setIsFullAccessChecked(true);
    } else {
      setIsFullAccessChecked(false);
    }
  }, [allPermissions, staffPermissions]);

  const handleFinish = async () => {
    const permissions = staffPermissions.map((p) => p.permission_id);

    const currentDateTime = dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");

    try {
      const response = await axiosInstance.post(
        `/staff/update_permissions/${staff.staff_id}`,
        {
          permission_ids: permissions.length > 0 ? permissions : [null],
          gived_by: user.id,
          gived_at: currentDateTime,
        }
      );
      if (response.request.status == 200) {
        notification.success({
          message: "อัปเดตสิทธิ์สำเร็จ",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });

        onClose();
      }
    } catch (error) {
      notification.error({
        message: "ไม่สามารถอัปเดตสิทธิ์ผู้ใช้ได้",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    }
  };

  const handleCheckboxChange = (value, checked) => {
    let updatedPermissions = [...staffPermissions];

    if (checked) {
      updatedPermissions.push({ permission_id: value });
    } else {
      updatedPermissions = updatedPermissions.filter(
        (item) => item.permission_id !== value
      );
    }

    setStaffPermissions(updatedPermissions);

    const allPermissionIds = allPermissions.map(
      (permission) => permission.permission_id
    );
    if (updatedPermissions.length === allPermissionIds.length) {
      setIsFullAccessChecked(true);
    } else {
      setIsFullAccessChecked(false);
    }
  };

  const handleFullAccessChange = (e) => {
    const checked = e.target.checked;
    setIsFullAccessChecked(checked);

    if (checked) {
      const allPermissionIds = allPermissions.map(
        (permission) => permission.permission_id
      );
      setStaffPermissions(
        allPermissionIds.map((id) => ({ permission_id: id }))
      );
    } else {
      setStaffPermissions([]);
    }
  };

  return (
    <Modal
      title={
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-800">
            จัดการสิทธิ์การเข้าถึง
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
      <Spin spinning={loading}>
        <Form onFinish={handleFinish} layout="vertical" className="space-y-6">
          <Form.Item
            name="permissions"
            label={
              <span className="text-lg font-medium text-gray-700">
                เลือกสิทธิ์การเข้าถึง
              </span>
            }
            valuePropName="value"
            initialValue={staffPermissions.map((p) => p.permission_id)}
          >
            <div className="flex flex-col gap-6">
              <Checkbox
                checked={isFullAccessChecked}
                onChange={handleFullAccessChange}
                className="max-w-max flex items-center p-3 border rounded-lg hover:bg-blue-50 transition-colors text-base"
              >
                เลือกทั้งหมด
              </Checkbox>

              <div className="grid grid-cols-2 gap-6">
                {allPermissions.map((item) => (
                  <CustomCheckbox
                    key={item.permission_id}
                    value={item.permission_id}
                    staff={staffPermissions}
                    onChange={handleCheckboxChange}
                    label={item.permission_name}
                    des={item.permission_des}
                  />
                ))}
              </div>
            </div>
          </Form.Item>

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
      </Spin>
    </Modal>
  );
}

const CustomCheckbox = ({ value, label, staff, onChange, des }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(staff.some((item) => item.permission_id === value));
  }, [staff, value]);

  const handleClick = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onChange(value, newCheckedState);
  };

  return (
    <div
      className="flex flex-col cursor-pointer p-3 border rounded-lg hover:bg-blue-50 transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => {}}
          className="w-4 h-4"
        />
        <span className="text-base font-medium text-gray-700 ml-2">
          {label}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1.5 ml-6">{des}</p>
    </div>
  );
};

export default PermissionModal;
