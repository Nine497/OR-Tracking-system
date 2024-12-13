import React from "react";
import { Modal, Form, Checkbox, Button } from "antd";

function PermissionModal({ visible, user, onClose }) {
  const handleFinish = (values) => {
    console.log("Updated permissions for:", user.userName, values);
    onClose();
  };

  const permissions = [
    { value: "read", label: "Assign Permissions" },
    { value: "write", label: "User Management" },
    { value: "edit", label: "Case Management" },
    { value: "delete", label: "Link Management" },
    { value: "full", label: "Full Access", isFullWidth: true },
  ];

  const CustomCheckbox = ({ value, label, isFullWidth = false }) => {
    return (
      <Checkbox
        value={value}
        className={`flex items-center p-3 border rounded-lg hover:bg-blue-50 transition-colors text-base ${
          isFullWidth
            ? "bg-blue-50 hover:bg-blue-100 font-semibold text-blue-800 col-span-2"
            : ""
        }`}
      >
        <span className="text-base font-normal">{label}</span>
      </Checkbox>
    );
  };

  return (
    <Modal
      title={
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-800">
            Manage Permissions
          </span>
          <span className="mt-1 text-lg font-medium text-blue-600">
            #{user?.userNumber} - {user?.fullName}
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
      <Form onFinish={handleFinish} layout="vertical" className="space-y-6">
        <Form.Item
          name="permissions"
          label={
            <span className="text-lg font-medium text-gray-700">
              Select Permissions
            </span>
          }
        >
          <Checkbox.Group className="grid grid-cols-2 gap-6">
            {permissions.map((item) => (
              <CustomCheckbox
                key={item.value}
                value={item.value}
                label={item.label}
                isFullWidth={item.isFullWidth}
              />
            ))}
          </Checkbox.Group>
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

export default PermissionModal;
