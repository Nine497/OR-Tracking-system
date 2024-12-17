import React, { useState, useEffect } from "react";
import { Form, Button, DatePicker, Alert, notification } from "antd";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

// Component 1: No Link Created Yet
const NoLinkComponent = ({ onGenerateLink }) => (
  <div className="w-full max-w-md">
    <DatePicker
      showTime
      className="w-full"
      format="YYYY-MM-DD HH:mm:ss"
      placeholder="Select expiration date and time"
      onChange={onGenerateLink}
    />
  </div>
);

// Component 2: Active Link
const ActiveLinkComponent = ({ link, expirationTime, handleCopyLink }) => (
  <div className="w-full max-w-md space-y-4">
    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-md flex items-center justify-between">
      <div className="flex-grow mr-4">
        <p className="text-sm text-gray-800 font-medium truncate" title={link}>
          {link}
        </p>
      </div>
      <Button
        type="default"
        size="small"
        onClick={() => handleCopyLink(link)}
        className="px-3 py-3 border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors text-lg"
      >
        Copy
      </Button>
    </div>
    <div className="text-center">
      <p className="text-green-600 text-lg">
        <span className="font-semibold">Link valid until :</span>{" "}
        <span className="text-gray-700 font-semibold">
          {moment(expirationTime).format("YYYY-MM-DD HH:mm:ss")}
        </span>
      </p>
    </div>
  </div>
);

// Component 3: Expired Link
const ExpiredLinkComponent = () => (
  <div className="w-full max-w-md">
    <Alert
      message="Link Expired"
      type="error"
      showIcon
      className="mb-4 shadow-sm text-lg font-bold"
    />
  </div>
);

// Main Link Form Component
const LinkForm = ({
  formLink,
  onClose,
  link,
  isLinkExpired,
  handleCopyLink,
  record,
}) => {
  const { user } = useAuth();
  const [expirationTime, setExpirationTime] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get(
          `link_cases/getLast/  ${record.surgery_case_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          console.log("respond : ", response.data);
          setExpirationTime(response.data.expiration_time);
        }
      } catch (err) {
        notification.error({
          message: "Error Fetching Data",
          description: "Unable to fetch surgery case data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

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
        setExpirationTime(response.data.expiration_time);
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

  return (
    <Form
      form={formLink}
      layout="vertical"
      className="p-6 bg-white rounded-lg max-w-md mx-auto"
    >
      <Form.Item
        name="expirationTime"
        label={
          <div className="text-center mb-4">
            <span className="text-lg font-bold text-gray-800">
              Expiration Time
            </span>
          </div>
        }
      >
        <div className="flex flex-col items-center space-y-6 w-full">
          {isLinkExpired ? (
            <ExpiredLinkComponent />
          ) : expirationTime ? (
            <ActiveLinkComponent
              link={link}
              expirationTime={expirationTime}
              handleCopyLink={handleCopyLink}
            />
          ) : (
            <NoLinkComponent onGenerateLink={handleGenerateLink} />
          )}
        </div>
      </Form.Item>

      <div className="flex justify-center space-x-4 mt-6">
        {isLinkExpired || expirationTime ? (
          <Button
            onClick={onClose}
            className="px-6 py-2 text-base rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel Link
          </Button>
        ) : (
          <Button
            onClick={() => handleGenerateLink(record.surgery_case_id)}
            type="primary"
            htmlType="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-md transition-colors"
          >
            Generate Link
          </Button>
        )}
      </div>
    </Form>
  );
};

export default LinkForm;
