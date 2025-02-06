import React, { useEffect, useState } from "react";
import { Modal, Form, notification } from "antd";
import TimelineStatus from "./TimelineStatusModal";
import LinkForm from "./LinkForm";

function UpdateModal({ visible, record, onClose, type }) {
  const [formLink] = Form.useForm();
  useEffect(() => {
    console.log("UpdateModal record ", record);
  }, []);

  if (!record) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex flex-col items-center justify-center p-2">
          <span className="text-2xl font-semibold text-gray-800">
            {type === "status" ? "Status Timeline" : "การตั้งค่าลิงก์"}
          </span>
          <span className="text-2xl font-semibold text-blue-600">
            HN : {record.hn_code}
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      className="rounded-lg min-w-[35%] sm:max-w-3xl md:max-w-2xl"
      style={{
        body: {
          borderRadius: "8px",
        },
      }}
    >
      {type === "status" ? (
        <TimelineStatus onClose={onClose} record={record} />
      ) : (
        <LinkForm formLink={formLink} onClose={onClose} record={record} />
      )}
    </Modal>
  );
}

export default UpdateModal;
