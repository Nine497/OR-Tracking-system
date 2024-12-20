import React, { useState, useEffect } from "react";
import { Form, Button, DatePicker, Alert, notification, Modal } from "antd";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";
import { Icon } from "@iconify/react";

const CancelLinkModal = ({ visible, onCancel, onConfirm }) => {
  return (
    <Modal
      title={
        <span className="text-2xl font-semibold">
          Confirm Cancellation Link
        </span>
      }
      open={visible}
      centered
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          <span className="text-lg font-normal">No</span>
        </Button>,
        <Button key="submit" type="primary" danger onClick={onConfirm}>
          <span className="text-lg font-normal">Yes</span>
        </Button>,
      ]}
    >
      <div className="text-base">
        <p className="font-normal">Are you sure you want to cancel the link?</p>
        <p className="text-red-500 font-normal">
          This link will no longer be valid and can only be created new.
        </p>
      </div>
    </Modal>
  );
};

const NoLinkComponent = ({ onGenerateLink }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const handleDateChange = (date) => {
    console.log(date);
    setSelectedDate(date);
  };

  return (
    <div className="w-full space-y-5 px-20">
      <DatePicker
        showTime
        className="w-full"
        format="YYYY-MM-DD HH:mm"
        placeholder="Select expiration date and time"
        onChange={handleDateChange}
        disabledDate={(current) => current && current < moment().startOf("day")}
        showNow={false}
      />
      <Button
        onClick={() => onGenerateLink(selectedDate)}
        type="primary"
        htmlType="button"
        className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-md transition-colors"
      >
        <span className="font-normal">Generate Link</span>
      </Button>
    </div>
  );
};

const ActiveLinkComponent = ({ link, expirationTime, handleCopyLink }) => (
  <div className="w-full space-y-5 px-10">
    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-md flex items-center justify-between">
      <p className="text-base text-gray-800 font-medium truncate" title={link}>
        {link}
      </p>
      <Button
        type="default"
        size="small"
        onClick={() => handleCopyLink(link)}
        className="px-4 py-4 border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors text-lg flex items-center gap-2"
      >
        <Icon icon="solar:copy-linear" className="text-xl" />
        <span className="font-normal">Copy</span>
      </Button>
    </div>
    <div className="text-center">
      <p className="text-green-600 text-lg">
        <span className="font-semibold">Link valid until :</span>{" "}
        <span className="text-gray-700 font-semibold">{expirationTime}</span>
      </p>
    </div>
  </div>
);

const ExpiredLinkComponent = ({ expirationTime }) => (
  <div className="w-full h-full flex items-center justify-center space-y-5 px-10">
    <Alert
      message={
        <span className="font-medium">Link Expired {expirationTime}</span>
      }
      type="error"
      showIcon
      className="mb-4 shadow-sm text-xl"
    />
  </div>
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
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200 && response.data) {
          console.log("respond: ", response.data);
          setLinkData(response.data);
          console.log("Res data : ", response.data);
        } else {
          notification.warning({
            message: "No Data Found",
            description: "No data available for the specified surgery case.",
          });
          setLinkData(null);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn("No data found (404).");
          setLinkData(null);
        } else {
          notification.error({
            message: "Error Fetching Data",
            description: err.response
              ? `Server responded with status ${err.response.status}: ${
                  err.response.data.message || "Unknown error"
                }`
              : "Unable to fetch surgery case data. Please check your connection and try again.",
          });
          setLinkData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [record.surgery_case_id, user.id]);

  const createLink = async (linkData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axiosInstance.post(`/link_cases/`, linkData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data) {
        setLinkData(response.data);
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
        message: "Expiration Time Missing",
        description:
          "Please select an expiration time before generating the link.",
      });
      return;
    }

    const expiration_time = new Date(date);
    const created_by = user?.id;

    if (!created_by) {
      notification.error({
        message: "User ID Missing",
        description: "User ID is missing, please log in.",
      });
      return;
    }
    const linkData = {
      surgery_case_id: record.surgery_case_id,
      expiration_time,
      created_by,
    };

    createLink(linkData);
  };

  const handleCancelLink = async () => {
    const token = localStorage.getItem("jwtToken");
    const surgeryCaseLinksId = linkData?.surgery_case_links_id;

    if (!surgeryCaseLinksId) {
      notification.error({
        message: "Cancellation Failed",
        description: "Unable to find the link ID. Please try again.",
      });
      return;
    }

    try {
      const response = await axiosInstance.patch(
        `/link_cases/update_status`,
        {
          surgery_case_links_id: surgeryCaseLinksId,
          isactive: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Link Cancelled",
          description:
            "The link has been successfully cancelled. A new link must be generated if needed.",
        });
        setLinkData(null);
        setIsModalVisible(false);
      } else {
        notification.error({
          message: "Cancellation Failed",
          description:
            response.data?.message ||
            "Unable to cancel the link. Please try again.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error Cancelling Link",
        description:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
      });
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
  };

  const handleConfirm = () => {
    console.log("Link Cancelled");
    notification.success({
      message: "Link Cancelled",
      description: "The link has been successfully cancelled.",
    });
    setIsModalVisible(false);
  };

  return (
    <Form
      form={formLink}
      layout="vertical"
      className=" bg-white rounded-lg mx-auto"
    >
      <Form.Item name="expirationTime">
        <div className="flex flex-col items-center space-y-6 w-full">
          {linkData?.expiration_time &&
          moment(linkData.expiration_time).isBefore(moment()) ? (
            <ExpiredLinkComponent
              expirationTime={moment(linkData.expiration_time).format(
                "YYYY-MM-DD HH:mm"
              )}
            />
          ) : linkData?.expiration_time ? (
            <ActiveLinkComponent
              link={`${BASE_URL}ptr?link=${linkData.surgery_case_links_id}`}
              expirationTime={moment(linkData.expiration_time).format(
                "YYYY-MM-DD HH:mm"
              )}
              handleCopyLink={handleCopyLink}
            />
          ) : (
            <NoLinkComponent onGenerateLink={handleGenerateLink} />
          )}
        </div>
      </Form.Item>

      <div className="flex justify-center space-x-4 mt-6">
        {linkData?.expiration_time ? (
          <>
            <Button
              type="primary"
              danger
              variant="danger"
              onClick={showModal}
              className="px-6 py-4 text-white text-lg rounded-md transition-colors"
            >
              <span className="font-normal">Cancel Link</span>
            </Button>

            <CancelLinkModal
              visible={isModalVisible}
              onCancel={handleCancelModal}
              onConfirm={handleCancelLink}
            />
          </>
        ) : null}
      </div>
    </Form>
  );
};

export default LinkForm;
