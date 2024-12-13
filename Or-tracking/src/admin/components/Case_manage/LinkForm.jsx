import React, { useState, useEffect } from "react";
import { Form, Button, DatePicker, Alert } from "antd";
import moment from "moment";

const LinkForm = ({
  formLink,
  handleLinkFinish,
  onClose,
  expirationTime: propExpirationTime,
  link,
  isLinkExpired,
  handleCopyLink,
  record,
}) => {
  const [expirationTime, setExpirationTime] = useState(propExpirationTime);

  useEffect(() => {
    if (propExpirationTime) {
      setExpirationTime(propExpirationTime);
    }
  }, [propExpirationTime]);

  const handleGenerateLink = (caseID) => {
    if (expirationTime) {
      const currentTime = new Date();
      const expirationDate = new Date(expirationTime);
      const diffInMs = expirationDate - currentTime;
      const diffInHours = Math.max(diffInMs / (1000 * 60 * 60), 0);
      console.log(caseID, diffInHours);
    } else {
      console.error("Expiration time is not selected");
    }
  };

  const handleExpirationTimeChange = (date) => {
    setExpirationTime(date);
  };

  const handleFinish = (values) => {
    console.log("Form values on finish:", values);
    handleLinkFinish(values);
  };

  return (
    <Form
      form={formLink}
      onFinish={handleFinish}
      layout="vertical"
      initialValues={{
        expirationTime: expirationTime || null,
      }}
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
            <div className="w-full max-w-md">
              <Alert
                message="Link Expired"
                type="error"
                showIcon
                className="mb-4 shadow-sm text-lg font-bold"
              />
            </div>
          ) : expirationTime ? (
            <div className="w-full max-w-md space-y-4">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-md flex items-center justify-between">
                <div className="flex-grow mr-4">
                  <p
                    className="text-sm text-gray-800 font-medium truncate "
                    title={link}
                  >
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
          ) : (
            <div className="w-full max-w-md">
              <DatePicker
                showTime
                className="w-full"
                value={expirationTime ? moment(expirationTime) : null}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="Select expiration date and time"
                onChange={handleExpirationTimeChange}
              />
            </div>
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
