import React, { useEffect, useState } from "react";
import { Modal, Form, notification } from "antd";
import StatusForm from "./StatusForm";
import LinkForm from "./LinkForm";

function UpdateModal({ visible, record, onClose, type }) {
  const [formStatus] = Form.useForm();
  const [formLink] = Form.useForm();
  const [isLinkExpired, setIsLinkExpired] = useState(false);
  const [expirationTime, setExpirationTime] = useState(null);
  const [link, setLink] = useState(null);

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

  useEffect(() => {
    if (record?.expirationTime) {
      const currentTime = new Date();
      const expiryTime = new Date(record.expirationTime);
      setExpirationTime(expiryTime);
      setLink(`http://172.16.2.171:5173/status/${record.jwtToken}`);

      if (expiryTime < currentTime) {
        setIsLinkExpired(true);
      } else {
        setIsLinkExpired(false);
      }
    }
  }, [record]);

  const handleStatusFinish = (values) => {
    console.log("Status Form values:", values);
    onClose();
  };

  const handleLinkFinish = (values) => {
    console.log("Link Form values:", values);
    onClose();
  };
  return (
    <Modal
      title={
        <div className="flex flex-col items-center justify-center p-2">
          <span className="text-2xl font-semibold text-gray-800">
            {type === "status" ? "Update Case Status" : "Link Configuration"}
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
          borderRadius: "8px",
        },
      }}
      width={800}
    >
      {type === "status" ? (
        <StatusForm
          formStatus={formStatus}
          handleStatusFinish={handleStatusFinish}
          onClose={onClose}
          record={record}
        />
      ) : (
        <LinkForm
          formLink={formLink}
          handleLinkFinish={handleLinkFinish}
          onClose={onClose}
          expirationTime={expirationTime}
          link={link}
          isLinkExpired={isLinkExpired}
          handleCopyLink={handleCopyLink}
          record={record}
        />
      )}
    </Modal>
  );
}

export default UpdateModal;
