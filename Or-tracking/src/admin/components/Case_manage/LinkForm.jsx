import React, { useState, useEffect } from "react";
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
  Badge,
} from "antd";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { Icon } from "@iconify/react";

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
  const [selectedDate, setSelectedDate] = useState(null);

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
            current && current < moment().startOf("day")
          }
          showNow={false}
        />

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

const LinkDisplay = ({ link, handleCopyLink, onCancelLink, isActive }) => (
  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
    <div className="flex items-center justify-between">
      {isActive ? (
        <div>
          Link :{" "}
          <Tag color="success" className="px-3 py-1 text-sm whitespace-nowrap">
            Active
          </Tag>
        </div>
      ) : (
        <div>
          Link :{" "}
          <Tag color="error" className="px-3 py-1 text-sm whitespace-nowrap">
            Expired
          </Tag>
        </div>
      )}
      <div className="flex gap-2 shrink-0">
        <Tooltip title="Copy Link">
          <Button
            type="default"
            icon={<Icon icon="bx:bx-copy" />}
            onClick={() => handleCopyLink(link)}
            className="flex items-center gap-1"
          >
            Copy
          </Button>
        </Tooltip>
        <Tooltip title="Cancel Link">
          <Button
            type="primary"
            danger
            icon={<Icon icon="bx:bx-x" />}
            onClick={onCancelLink}
            className="flex items-center gap-1"
          >
            Cancel
          </Button>
        </Tooltip>
      </div>
    </div>

    <div className="w-full">
      <Input
        value={link}
        readOnly
        className="font-mono text-sm bg-white"
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      />
    </div>
  </div>
);

const LinkContainer = ({ children }) => (
  <div className="w-full max-w-2xl mx-auto bg-white">
    <div className=" space-y-6">{children}</div>
  </div>
);

const InfoItem = ({ label, value, children, isActive, isCount }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 font-medium w-32 mb-1 sm:mb-0">{label}</span>
    {isCount ? (
      <Tag color="blue" className="px-3 py-1 text-sm flex items-center gap-2">
        <Icon icon="heroicons:user-group" className="text-base" />
        {value} times
      </Tag>
    ) : children ? (
      <div className="flex items-center gap-2">{children}</div>
    ) : (
      <span className="text-gray-800 flex items-center gap-2">
        <Icon
          icon={
            label === "Created By"
              ? "heroicons:user"
              : label === "Created At"
              ? "heroicons:calendar"
              : "heroicons:clock"
          }
          className="text-gray-400"
        />
        {value}
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
    moment(linkData.expiration_time)
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
                  : moment(linkData.expiration_time).format("YYYY-MM-DD, HH:mm")
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
                    current && current < moment().startOf("day")
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
            value={moment(linkData.created_at).format("YYYY-MM-DD, HH:mm")}
          />
          <InfoItem label="Created By" value={linkData.staff_fullname} />
          <InfoItem
            label="Last Accessed"
            value={
              linkData.last_accessed
                ? moment(linkData.last_accessed).format("YYYY-MM-DD, HH:mm")
                : "N/A"
            }
          />
          <InfoItem
            label="Logged In Count"
            value={linkData.loggedInCount ?? "0"}
            isCount={true}
          />
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
        <InfoItem
          label="Expiration At"
          value={moment(linkData.expiration_time).format("YYYY-MM-DD, HH:mm")}
          isActive={false}
        />
        <InfoItem
          label="Created At"
          value={moment(linkData.created_at).format("YYYY-MM-DD, HH:mm")}
        />
        <InfoItem label="Created By" value={linkData.staff_fullname} />
        <InfoItem
          label="Last Accessed"
          value={
            linkData.last_accessed
              ? moment(linkData.last_accessed).format("YYYY-MM-DD, HH:mm")
              : "N/A"
          }
        />
        <InfoItem
          label="Logged In Count"
          value={linkData.loggedInCount ?? "0"}
          isCount={true}
        />
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
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get(
          `link_cases/getLast/${record.surgery_case_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200 && response.data) {
          console.log(response.data);

          setLinkData(response.data);
        } else {
          notification.warning({
            message: "No Data Found",
            description: "No data available for the specified surgery case.",
          });
          setLinkData(null);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setLinkData(null);
        } else {
          notification.error({
            message: "Error Fetching Data",
            description: "Unable to fetch surgery case data. Please try again.",
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
      const response = await axiosInstance.post("/link_cases/", linkData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setLinkData(response.data);
        notification.success({
          message: "Link Generated",
          description: "New link has been successfully created.",
        });
      }
    } catch (err) {
      notification.error({
        message: "Error Creating Link",
        description: "Unable to create the link. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = (date) => {
    if (!date) {
      notification.error({
        message: "Expiration Time Required",
        description:
          "Please select an expiration time before generating the link.",
      });
      return;
    }

    if (!user?.id) {
      notification.error({
        message: "Authentication Required",
        description: "Please log in to generate a link.",
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
      const token = localStorage.getItem("jwtToken");
      const response = await axiosInstance.patch(
        "/link_cases/update_status",
        {
          surgery_case_links_id: linkData.surgery_case_links_id,
          isactive: false,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Link Cancelled",
          description: "The link has been successfully cancelled.",
        });
        setLinkData(null);
        setIsModalVisible(false);
      }
    } catch (error) {
      notification.error({
        message: "Error Cancelling Link",
        description: "Unable to cancel the link. Please try again.",
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
          moment(linkData.expiration_time).isBefore(moment()) ? (
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
