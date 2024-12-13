import React from "react";
import { Form, Select, Button } from "antd";

const StatusForm = ({ formStatus, handleStatusFinish, onClose, record }) => {
  return (
    <Form
      form={formStatus}
      onFinish={handleStatusFinish}
      layout="vertical"
      initialValues={{
        status: record?.status,
      }}
    >
      <Form.Item
        name="status"
        label={
          <span className="text-lg font-medium text-gray-700">Status</span>
        }
      >
        <Select>
          <Select.Option value="before_treatment">
            Before treatment
          </Select.Option>
          <Select.Option value="transferred_to_operating_room">
            Transferred to the operating room
          </Select.Option>
          <Select.Option value="undergoing_procedure">
            Undergoing the procedure
          </Select.Option>
          <Select.Option value="procedure_completed">
            Procedure completed
          </Select.Option>
          <Select.Option value="patient_returned_to_recovery_room">
            Patient returned to the recovery room
          </Select.Option>
        </Select>
      </Form.Item>

      <div className="flex justify-center space-x-4 mb-6">
        <Button onClick={onClose} className="px-6 py-2 text-lg">
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-lg"
        >
          Update Status
        </Button>
      </div>
    </Form>
  );
};

export default StatusForm;
