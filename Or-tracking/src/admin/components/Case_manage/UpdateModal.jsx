import React, { useEffect, useState } from "react";
import { Modal, Form, notification } from "antd";
import TimelineStatus from "./TimelineStatusModal";
import LinkForm from "./LinkForm";

function UpdateModal({ visible, record, onClose, type }) {
  const [formLink] = Form.useForm();

  const handleCopyLink = (link) => {
    const fallbackCopy = () => {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);

      try {
        textArea.select();
        document.execCommand("copy");
        notification.success({
          message: "Copied!",
          description: "The link has been copied to your clipboard.",
        });
      } catch (err) {
        notification.error({
          message: "Copy Failed",
          description: "Unable to copy the link. Please copy manually.",
        });
      }

      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          notification.success({
            message: "Copied!",
            description: "The link has been copied to your clipboard.",
          });
        })
        .catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  };

  if (!record) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex flex-col items-center justify-center p-2">
          <span className="text-2xl font-semibold text-gray-800">
            {type === "status" ? "Status Timeline" : "Link Setting"}{" "}
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
      className="rounded-lg sm:max-w-3xl md:max-w-2xl w-full"
      style={{
        body: {
          borderRadius: "8px",
        },
      }}
    >
      {type === "status" ? (
        <TimelineStatus onClose={onClose} record={record} />
      ) : (
        <LinkForm
          formLink={formLink}
          onClose={onClose}
          handleCopyLink={handleCopyLink}
          record={record}
        />
      )}
    </Modal>
  );
}

export default UpdateModal;
