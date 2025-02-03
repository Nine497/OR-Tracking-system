import React, { useEffect, useState } from "react";
import { Modal, Form, notification } from "antd";
import TimelineStatus from "./TimelineStatusModal";
import LinkForm from "./LinkForm";

function UpdateModal({ visible, record, onClose, type }) {
  const [formLink] = Form.useForm();
  useEffect(() => {
    console.log("UpdateModal record ", record);
  }, []);

  const handleCopyLink = (linkUrl, pin_decrypted, patient_fullname) => {
    if (!linkUrl || !pin_decrypted) {
      notification.warning({
        message: "ไม่มีข้อมูลให้คัดลอก กรุณาสร้างลิงก์และ PIN ก่อน",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
      return;
    }

    // เปลี่ยนแปลงตรงนี้
    const textToCopy = `คุณ ${patient_fullname}\nURL: ${linkUrl}\nPIN: ${pin_decrypted}`;

    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);

    try {
      textArea.select();
      document.execCommand("copy");

      notification.success({
        message: "ลิงก์และ PIN ได้ถูกคัดลอกไปยังคลิปบอร์ดของคุณแล้ว",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    } catch (err) {
      notification.error({
        message: "ไม่สามารถคัดลอกข้อมูลได้ กรุณาคัดลอกด้วยตนเอง",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
      console.error("Copy Error:", err);
    } finally {
      document.body.removeChild(textArea);
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
      className="rounded-lg min-w-[30%] sm:max-w-3xl md:max-w-2xl"
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
