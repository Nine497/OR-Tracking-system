import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  DatePicker,
  Alert,
  notification,
  Modal,
  Spin,
} from "antd";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { Icon } from "@iconify/react";

const LinkContainer = ({ children }) => (
  <div className="w-full max-w-2xl mx-auto px-6 py-8 bg-white rounded-lg">
    <div className="flex flex-col space-y-6">{children}</div>
  </div>
);

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

const LinkDisplay = ({ link, handleCopyLink }) => (
  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex items-center justify-between gap-4">
    <p className="text-base text-gray-800 truncate flex-1" title={link}>
      {link}
    </p>
    <Button
      type="default"
      onClick={() => handleCopyLink(link)}
      className="flex items-center gap-2 min-w-[100px] h-10"
    >
      <Icon icon="solar:copy-linear" className="text-lg" />
      <span className="text-base">Copy</span>
    </Button>
  </div>
);

const ActiveLinkComponent = ({
  link,
  expirationTime,
  handleCopyLink,
  onCancelLink,
}) => (
  <LinkContainer>
    <LinkDisplay link={link} handleCopyLink={handleCopyLink} />
    <Alert
      message={`Link valid until : ${expirationTime}`}
      type="success"
      showIcon
      className="text-base font-medium"
    />
    <Button
      type="primary"
      danger
      onClick={onCancelLink}
      className="w-full h-10 text-base mt-4"
    >
      Cancel Link
    </Button>
  </LinkContainer>
);

const ExpiredLinkComponent = ({
  link,
  expirationTime,
  handleCopyLink,
  onCancelLink,
}) => (
  <LinkContainer>
    <LinkDisplay link={link} handleCopyLink={handleCopyLink} />
    <Alert
      message={`Link Expired ${expirationTime}`}
      type="error"
      showIcon
      className="text-base font-medium"
    />
    <Button
      type="primary"
      danger
      onClick={onCancelLink}
      className="w-full h-10 text-base mt-4"
    >
      Cancel Link
    </Button>
  </LinkContainer>
);

const LinkForm = ({ formLink, onClose, handleCopyLink, record }) => {
  const { user } = useAuth();
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
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
              expirationTime={moment(linkData.expiration_time).format(
                "YYYY-MM-DD HH:mm"
              )}
              handleCopyLink={handleCopyLink}
              onCancelLink={() => setIsModalVisible(true)}
            />
          ) : (
            <ActiveLinkComponent
              link={linkUrl}
              expirationTime={moment(linkData.expiration_time).format(
                "YYYY-MM-DD HH:mm"
              )}
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
