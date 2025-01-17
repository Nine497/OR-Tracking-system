import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Button,
  DatePicker,
  notification,
  Modal,
  Spin,
  Tag,
  Tooltip,
  Input,
  Typography,
  QRCode,
} from "antd";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { Icon } from "@iconify/react";
import Logo from "../../assets/Logo2.png";

const CancelLinkModal = ({ visible, onCancel, onConfirm }) => (
  <Modal
    title="Cancel Link Confirmation"
    open={visible}
    centered
    onCancel={onCancel}
    footer={[
      <Button key="back" onClick={onCancel} className="min-w-[80px]">
        No
      </Button>,
      <Button
        key="submit"
        type="primary"
        danger
        onClick={onConfirm}
        className="min-w-[80px]"
      >
        Yes
      </Button>,
    ]}
  >
    <div className="space-y-2">
      <p className="text-base">Are you sure you want to cancel the link?</p>
      <p className="text-base text-red-500">
        This link will no longer be valid and can only be created new.
      </p>
    </div>
  </Modal>
);

const NoLinkComponent = ({ onGenerateLink }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, "day"));

  return (
    <LinkContainer>
      <div className="space-y-4">
        <DatePicker
          showTime
          className="w-full"
          size="large"
          popupClassName="text-sm"
          format="YYYY-MM-DD HH:mm"
          placeholder="Select expiration date and time"
          onChange={(date) => setSelectedDate(date)}
          disabledDate={(current) =>
            current && current < dayjs().startOf("day")
          }
          showNow={false}
          defaultValue={dayjs().add(1, "day")}
        />
        <span className="text-sm text-gray-500">
          * ค่าเริ่มต้นคือ +24 ชั่วโมง จากเวลาปัจจุบัน
        </span>
        <Button
          type="primary"
          onClick={() => onGenerateLink(selectedDate)}
          className="w-full h-10 text-base"
        >
          Generate Link
        </Button>
      </div>
    </LinkContainer>
  );
};

function doDownload(url, fileName) {
  const a = document.createElement("a");
  a.download = fileName;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const LinkDisplay = ({ link, handleCopyLink, onCancelLink, isActive }) => {
  const qrCanvasRef = useRef(null);

  const downloadQRCode = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      doDownload(url, "QRCode.png");
    }
  };

  return (
    <div className="w-full max-w-full bg-gray-50 rounded-xl p-4 sm:p-5 lg:p-6 space-y-4 shadow-sm border border-gray-100">
      {/* Header Section */}
      <div className="flex flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        {/* Status Section */}
        <div
          className={`
        inline-flex items-center gap-1.5 
        px-3 py-0.5
        text-sm
        rounded-full
        ${
          isActive
            ? "bg-green-50/50 text-green-600 ring-1 ring-green-200/60"
            : "bg-red-50/50 text-red-600 ring-1 ring-red-200/60"
        }
      `}
        >
          <span
            className={`
          w-1.5 h-1.5 
          rounded-full
          ${isActive ? "bg-green-500" : "bg-red-500"}
        `}
          />
          <span className="font-medium">{isActive ? "Active" : "Expired"}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 items-center justify-end">
          <Tooltip title="Copy Link">
            <Button
              icon={<Icon icon="bx:bx-copy" className="text-lg" />}
              onClick={() => handleCopyLink(link)}
              className="flex items-center gap-1.5 hover:border-blue-400 hover:text-blue-500 transition-colors 
                  h-8 md:h-9 px-2 md:px-3 text-sm md:text-base w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Copy</span>
            </Button>
          </Tooltip>

          {/* <Tooltip title="Download QR Code">
            <Button
              type="primary"
              icon={<Icon icon="mdi:download" className="text-lg" />}
              onClick={downloadQRCode}
              className="flex items-center gap-1.5 h-8 md:h-9 px-2 md:px-3 text-sm md:text-base w-full sm:w-auto"
            >
              <span className="hidden sm:inline">QR Code</span>
            </Button>
          </Tooltip> */}

          <Tooltip title="Cancel Link">
            <Button
              type="primary"
              danger
              icon={<Icon icon="bx:bx-x" className="text-lg" />}
              onClick={onCancelLink}
              className="flex items-center gap-1.5 hover:opacity-90 transition-opacity 
                  h-8 md:h-9 px-2 md:px-3 text-sm md:text-base w-full sm:w-auto"
            >
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Link Input Section */}
      <div className="w-full relative group">
        <Input
          value={link}
          readOnly
          className="font-mono text-xs sm:text-sm md:text-base bg-white/70 hover:bg-white focus:bg-white 
                   transition-colors pl-3 md:pl-4 pr-10 md:pr-12 py-2 md:py-2.5 rounded-lg 
                   border-gray-200 hover:border-gray-300 overflow-hidden text-ellipsis"
        />
        <Icon
          icon="heroicons:link"
          className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 
                   text-gray-400 group-hover:text-gray-600 transition-colors 
                   text-base md:text-lg"
        />
      </div>

      {/* Hidden QR Code */}
      <div className="hidden">
        <QRCode value={link} bgColor="#FFFFFF" size={256} bordered={false} />
      </div>
    </div>
  );
};

const LinkContainer = ({ children }) => (
  <div className="w-full mx-auto bg-white rounded-lg">
    <div className="space-y-6">{children}</div>
  </div>
);

const InfoItem = ({ label, value, children, isActive, isCount }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors rounded-lg px-3">
    <span className="text-gray-500 font-medium w-40 mb-2 sm:mb-0 text-sm sm:text-base">
      {label}
    </span>
    {isCount ? (
      <Tag
        bordered={false}
        color="magenta"
        className="px-3 py-1.5 text-sm sm:text-base flex items-center gap-2 font-medium transition-transform"
      >
        <Icon icon="heroicons:user-group" className="text-base sm:text-lg" />
        <span className="font-semibold">{value}</span>
        <span className="text-magenta-600/80">times</span>
      </Tag>
    ) : children ? (
      <div className="flex items-center gap-2 text-sm sm:text-base">
        {children}
      </div>
    ) : (
      <span className="text-gray-800 flex items-center gap-3 text-sm sm:text-base group">
        <Icon
          icon={
            label === "Created By"
              ? "heroicons:user"
              : label === "Created At"
              ? "heroicons:calendar"
              : "heroicons:clock"
          }
          className="text-gray-400 group-hover:text-gray-600 transition-colors text-lg sm:text-xl"
        />
        <span className="font-medium">{value}</span>
      </span>
    )}
  </div>
);

const ActiveLinkComponent = ({
  link,
  linkData,
  handleCopyLink,
  onCancelLink,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newExpirationTime, setNewExpirationTime] = useState(null);
  const [expirationTime, setExpirationTime] = useState(
    dayjs(linkData.expiration_time)
  );
  const handleExpirationChange = (date) => {
    setNewExpirationTime(date);
  };

  const handleSaveExpiration = async () => {
    try {
      await handleUpdateExpiration(newExpirationTime);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating expiration:", error);
    }
  };

  const handleUpdateExpiration = async (newTime) => {
    const response = await axiosInstance.put(
      `/link_cases/${linkData.surgery_case_links_id}/expiration`,
      {
        expiration_time: newTime,
      }
    );

    if (response.status === 200) {
      setExpirationTime(response.data.data.expiration_time);
      console.log("Expiration time updated successfully");
    } else {
      console.error("Failed to update expiration time");
    }
  };

  return (
    <LinkContainer>
      <LinkDisplay
        link={link}
        handleCopyLink={handleCopyLink}
        onCancelLink={onCancelLink}
        isActive={true}
      />

      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Typography.Title level={5} className="!m-0">
            Link Details
          </Typography.Title>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <InfoItem
              label="Expiration At"
              value={
                isEditing
                  ? newExpirationTime
                  : dayjs(linkData.expiration_time).format("YYYY-MM-DD, HH:mm")
              }
              isActive={true}
            >
              {isEditing ? (
                <DatePicker
                  showTime
                  size="middle"
                  className="w-full"
                  format="YYYY-MM-DD HH:mm"
                  onChange={(date) => handleExpirationChange(date)}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                  showNow={false}
                  placeholder="Select new date and time"
                  popupClassName="text-sm shadow-lg"
                />
              ) : null}
            </InfoItem>
          </div>

          {isEditing ? (
            <div className="flex gap-2">
              <Button
                type="primary"
                onClick={handleSaveExpiration}
                icon={<Icon icon="mdi:check-circle" />}
                className="flex items-center"
              >
                Save
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                icon={<Icon icon="mdi:cancel" />}
                className="flex items-center"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="primary"
              onClick={() => setIsEditing(true)}
              icon={<Icon icon="mdi:pencil" />}
              className="flex items-center ml-2"
            >
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <InfoItem
            label="Created At"
            value={dayjs(linkData.created_at).format("YYYY-MM-DD, HH:mm")}
          />
          <InfoItem label="Created By" value={linkData.staff_fullname} />
        </div>
      </div>
    </LinkContainer>
  );
};

const ExpiredLinkComponent = ({
  link,
  linkData,
  handleCopyLink,
  onCancelLink,
}) => (
  <LinkContainer>
    <LinkDisplay
      link={link}
      handleCopyLink={handleCopyLink}
      onCancelLink={() => onCancelLink(linkData.surgery_case_links_id)}
      isActive={false}
    />

    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Typography.Title level={5} className="!m-0">
          Link Details
        </Typography.Title>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <InfoItem
            label="Expiration At"
            value={dayjs(linkData.expiration_time).format("YYYY-MM-DD, HH:mm")}
            isActive={false}
          />
          <div className="flex gap-2">
            <Button
              disabled
              type="primary"
              onClick={() => setIsEditing(true)}
              icon={<Icon icon="mdi:pencil" />}
              className="flex items-center ml-2"
            >
              Edit
            </Button>
          </div>
        </div>
        <InfoItem
          label="Created At"
          value={dayjs(linkData.created_at).format("YYYY-MM-DD, HH:mm")}
        />
        <InfoItem label="Created By" value={linkData.staff_fullname} />
      </div>
    </div>
  </LinkContainer>
);

const LinkForm = ({ formLink, onClose, handleCopyLink, record }) => {
  const { user } = useAuth();
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    console.log(record);

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `link_cases/getLast/${record.surgery_case_id}`
        );

        if (response.status === 200 && response.data) {
          console.log(response.data);

          setLinkData(response.data);
        } else {
          notification.warning({
            message:
              "ไม่มีข้อมูลสำหรับเคสการผ่าตัดที่ระบุไว้ กรุณาลองใหม่อีกครั้ง",
            showProgress: true,
            placement: "topRight",
            pauseOnHover: true,
            duration: 2,
          });
          setLinkData(null);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setLinkData(null);
        } else {
          notification.error({
            message: "ไม่สามารถดึงข้อมูลเคสการผ่าตัดได้ กรุณาลองใหม่อีกครั้ง",
            showProgress: true,
            placement: "topRight",
            pauseOnHover: true,
            duration: 2,
          });
        }
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    fetchData();
  }, [record.surgery_case_id, user.id]);

  const createLink = async (linkData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axiosInstance.post("/link_cases/", linkData);
      if (response.data) {
        setLinkData(response.data);
        notification.success({
          message: "ลิงก์ใหม่ถูกสร้างสำเร็จเรียบร้อยแล้ว",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      }
    } catch (err) {
      notification.error({
        message: "ไม่สามารถสร้างลิงก์ได้ โปรดลองใหม่อีกครั้ง",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = (date) => {
    if (!date) {
      notification.warning({
        message: "กรุณาเลือกเวลาหมดอายุก่อนสร้างลิงก์",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
      return;
    }

    if (!user?.id) {
      notification.warning({
        message: "กรุณาเข้าสู่ระบบเพื่อสร้างลิงก์",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
      return;
    }

    createLink({
      surgery_case_id: record.surgery_case_id,
      expiration_time: new Date(date),
      created_by: user.id,
    });
  };

  const handleCancelLink = async () => {
    try {
      const response = await axiosInstance.patch("/link_cases/update_status", {
        surgery_case_links_id: linkData.surgery_case_links_id,
        isactive: false,
      });

      if (response.status === 200) {
        notification.success({
          message: "ลิงก์ถูกยกเลิกเรียบร้อยแล้ว",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
        setLinkData(null);
        setIsModalVisible(false);
      }
    } catch (error) {
      notification.error({
        message: "ไม่สามารถยกเลิกลิงก์ได้ กรุณาลองอีกครั้ง",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spin size="large" />
      </div>
    );
  }

  const linkUrl = linkData
    ? `${BASE_URL}ptr?link=${linkData.surgery_case_links_id}`
    : "";

  return (
    <Form form={formLink} layout="vertical" className="w-full">
      <div className="space-y-6">
        {linkData?.expiration_time ? (
          dayjs(linkData.expiration_time).isBefore(dayjs()) ? (
            <ExpiredLinkComponent
              link={linkUrl}
              linkData={linkData}
              handleCopyLink={handleCopyLink}
              onCancelLink={() => setIsModalVisible(true)}
            />
          ) : (
            <ActiveLinkComponent
              link={linkUrl}
              linkData={linkData}
              handleCopyLink={handleCopyLink}
              onCancelLink={() => setIsModalVisible(true)}
            />
          )
        ) : (
          <NoLinkComponent onGenerateLink={handleGenerateLink} />
        )}

        <CancelLinkModal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onConfirm={handleCancelLink}
        />
      </div>
    </Form>
  );
};

export default LinkForm;
