import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Button,
  DatePicker,
  notification,
  Modal,
  Spin,
  Tag,
  Input,
  Typography,
  QRCode,
} from "antd";
import { useAuth } from "../../context/AuthContext";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const CancelLinkModal = ({ visible, onCancel, onConfirm }) => (
  <Modal
    title="ยืนยันการยกเลิกลิงก์"
    open={visible}
    centered
    onCancel={onCancel}
    footer={[
      <Button key="back" onClick={onCancel} className="min-w-[80px]">
        ไม่
      </Button>,
      <Button
        key="submit"
        type="primary"
        danger
        onClick={onConfirm}
        className="min-w-[80px]"
      >
        ใช่
      </Button>,
    ]}
  >
    <div className="space-y-2">
      <p className="text-base">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกลิงก์นี้?</p>
      <p className="text-base text-red-500">
        ลิงก์นี้จะไม่สามารถใช้งานได้อีก และต้องสร้างใหม่เท่านั้น
      </p>
    </div>
  </Modal>
);

const NoLinkComponent = ({ onGenerateLink }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, "day"));

  return (
    <LinkContainer>
      <div className="space-y-2">
        <span className="text-base ">เลือกวัน/เวลาที่ลิงก์จะหมดอายุ</span>
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
        <div className="text-sm text-gray-500">
          * ค่าเริ่มต้นคือ +24 ชั่วโมง จากเวลาปัจจุบัน
        </div>
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

const LinkDisplay = ({
  link,
  handleCopyLink,
  onCancelLink,
  isActive,
  record,
}) => {
  // useEffect(() => {
  //   console.log("record", record);
  // }, []);

  return (
    <div className="w-full max-w-full bg-gray-50 rounded-xl p-4 sm:p-5 lg:p-6 space-y-4 shadow-sm border border-gray-100">
      <div className="flex flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div
          className={`
        inline-flex items-center gap-1.5 
        px-3 py-0.5
        text-sm
        rounded-full
        ${isActive
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
          <span className="font-medium">
            {isActive ? "ใช้งานได้" : "หมดอายุแล้ว"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 items-center justify-end">
          <Button
            icon={<Icon icon="bx:bx-copy" className="text-lg" />}
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 hover:border-blue-400 hover:text-blue-500 transition-colors 
                  h-8 md:h-9 px-2 md:px-3 text-sm md:text-base w-full sm:w-auto"
          >
            <span className="hidden sm:inline">คัดลอกลิงก์</span>
          </Button>

          <Button
            type="primary"
            danger
            icon={<Icon icon="bx:bx-x" className="text-lg" />}
            onClick={onCancelLink}
            className="flex items-center gap-1.5 hover:opacity-90 transition-opacity 
                  h-8 md:h-9 px-2 md:px-3 text-sm md:text-base w-full sm:w-auto"
          >
            <span className="hidden sm:inline">ยกเลิกลิงก์</span>
          </Button>
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
            label === "สร้างโดย"
              ? "heroicons:user"
              : label === "สร้างเมื่อ"
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
  record,
  linkData,
  handleCopyLink,
  onCancelLink,
  fetchData,
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
    const response = await axiosInstanceStaff.put(
      `/link_cases/${linkData.surgery_case_links_id}/expiration`,
      {
        expiration_time: newTime,
      }
    );

    if (response.status === 200) {
      setExpirationTime(response.data.data.expiration_time);
      // console.log("Expiration time updated successfully");
      fetchData();
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
        record={record}
      />
      <div className="w-full flex justify-center">
        <QRCode
          errorLevel="H"
          value={link}
          icon="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
        />
      </div>
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Typography.Title level={5} className="!m-0">
            รายละเอียดลิงก์
          </Typography.Title>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex gap-2">
            <InfoItem
              label="ลิงก์หมดอายุ"
              value={
                isEditing
                  ? newExpirationTime
                  : dayjs
                    .utc(linkData.expiration_time)
                    .tz("Asia/Bangkok").add(7, 'hour')
                    .format("YYYY-MM-DD, HH:mm")
              }
              isActive={true}
            >
              {isEditing && (
                <>
                  <DatePicker
                    showTime
                    size="middle"
                    className="max-w-46"
                    format="YYYY-MM-DD HH:mm"
                    onChange={handleExpirationChange}
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                    disabledTime={(current) => {
                      if (dayjs(current).isSame(dayjs(), "day")) {
                        return {
                          disabledHours: () => [
                            ...Array(dayjs().hour()).keys(),
                          ],
                          disabledMinutes: (hour) =>
                            hour === dayjs().hour()
                              ? [...Array(dayjs().minute()).keys()]
                              : [],
                        };
                      }
                      return {};
                    }}
                    showNow={false}
                    placeholder="เลือกวัน/เวลา"
                    popupClassName="text-sm shadow-lg"
                  />

                  {/* <Popconfirm
                    title={`คุณแน่ใจไหมที่จะตั้งค่าวันที่นี้: ${newExpirationTime.format(
                      "YYYY-MM-DD HH:mm"
                    )}?`}
                    onConfirm={handleSaveExpiration}
                    onCancel={handleCancel}
                    okText="Yes"
                    cancelText="No"
                    
                  > 
                   </Popconfirm>*/}
                  <Button
                    type="primary"
                    icon={<Icon icon="mdi:check-circle" />}
                    className="flex items-center"
                    disabled={!newExpirationTime}
                    onClick={handleSaveExpiration}
                  >
                    ยืนยัน
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    icon={<Icon icon="mdi:cancel" />}
                    className="flex items-center"
                  >
                    ยกเลิก
                  </Button>
                </>
              )}
            </InfoItem>
          </div>

          {isEditing ? null : (
            // <div className="flex gap-1">
            //   <Button
            //     type="primary"
            //     onClick={handleSaveExpiration}
            //     icon={<Icon icon="mdi:check-circle" />}
            //     className="flex items-center"
            //   >
            //     Save
            //   </Button>
            //   <Button
            //     onClick={() => setIsEditing(false)}
            //     icon={<Icon icon="mdi:cancel" />}
            //     className="flex items-center"
            //   >
            //     Cancel
            //   </Button>
            // </div>
            <Button
              type="primary"
              onClick={() => setIsEditing(true)}
              icon={<Icon icon="mdi:pencil" />}
              className="flex items-center ml-2"
            >
              แก้ไข
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <InfoItem
            label="สร้างเมื่อ"
            value={dayjs(linkData.created_at)
              .tz("Asia/Bangkok").add(7, 'hour')
              .format("YYYY-MM-DD, HH:mm")}
          />
          <InfoItem label="สร้างโดย" value={linkData.staff_fullname} />
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
      linkData={linkData}
    />

    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Typography.Title level={5} className="!m-0">
          Link Details ${linkData.expiration_time}
        </Typography.Title>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <InfoItem
            label="ลิงก์หมดอายุ"
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
              แก้ไข
            </Button>
          </div>
        </div>
        <InfoItem
          label="สร้างเมื่อ"
          value={dayjs(linkData.created_at).format("YYYY-MM-DD, HH:mm")}
        />
        <InfoItem label="สร้างโดย" value={linkData.staff_fullname} />
      </div>
    </div>
  </LinkContainer>
);

const LinkForm = ({ formLink, record }) => {
  const { user } = useAuth();
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // useEffect(() => {
  //   console.log("linkData", linkData);
  // }, [linkData]);
  // useEffect(() => {
  //   console.log("record", record);
  // }, [record]);
  useEffect(() => {
    fetchData();
  }, [record.surgery_case_id, user.id]);

  const handleCopyLink = async () => {
    const linkUrl = `${BASE_URL}ptr?link=${linkData.surgery_case_links_id}`;

    if (!linkUrl) {
      notification.warning({
        message: "ไม่มีข้อมูลให้คัดลอก กรุณาสร้างลิงก์ก่อน",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = linkUrl;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);

    try {
      textArea.select();
      document.execCommand("copy");

      notification.success({
        message: "ลิงก์ได้ถูกคัดลอกไปยังคลิปบอร์ดของคุณแล้ว",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    } catch (err) {
      notification.error({
        message: "ไม่สามารถคัดลอกลิงก์ได้ กรุณาคัดลอกด้วยตนเอง",
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

  const fetchData = async () => {
    setLoading(true);
    try {
      // console.log("Fetch ID", record.surgery_case_id);

      const response = await axiosInstanceStaff.get(
        `link_cases/getLast/${record.surgery_case_id}`
      );

      if (response.status === 200 && response.data) {
        // console.log("Res Data", response.data);

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

  const createLink = async (linkData) => {
    setLoading(true);
    try {
      const response = await axiosInstanceStaff.post("/link_cases/", linkData);
      if (response.data) {
        // console.log("Return response.data", response.data);

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
      expiration_time: date,
      created_by: user.id,
    });
  };

  const handleCancelLink = async () => {
    try {
      const response = await axiosInstanceStaff.patch(
        "/link_cases/update_status",
        {
          surgery_case_links_id: linkData.surgery_case_links_id,
          isactive: false,
        }
      );

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
          dayjs(linkData.expiration_time)
            .tz("Asia/Bangkok")
            .isBefore(dayjs().tz("Asia/Bangkok")) ? (
            <ExpiredLinkComponent
              link={linkUrl}
              record={record}
              handleCopyLink={handleCopyLink}
              onCancelLink={() => setIsModalVisible(true)}
              linkData={linkData}
            />
          ) : (
            <ActiveLinkComponent
              link={linkUrl}
              record={record}
              linkData={linkData}
              handleCopyLink={handleCopyLink}
              onCancelLink={() => setIsModalVisible(true)}
              fetchData={fetchData}
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
