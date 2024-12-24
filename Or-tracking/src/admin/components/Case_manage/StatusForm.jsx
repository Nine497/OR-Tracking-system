import React, { useEffect, useState } from "react";
import { Form, Select, Button, notification, Spin } from "antd";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const StatusForm = ({ formStatus, onClose, record }) => {
  const [allStatus, setAllStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [latestStatus, setLatestStatus] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setModalLoading(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get(
          `surgery_case/status/${record.surgery_case_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200 && response.data) {
          setLatestStatus(response.data);
          console.log("Res latestStatus data : ", response.data);
          console.log("Latest status ID: ", response.data.latestStatus);
        }
      } catch (err) {
        notification.error({
          message: "Error Fetching Data",
          description: err.response
            ? `Server responded with status ${err.response.status}: ${
                err.response.data.message || "Unknown error"
              }`
            : "Unable to fetch status data. Please check your connection and try again.",
        });
      } finally {
        setModalLoading(false);
      }
    };

    fetchData();
  }, [record]);

  useEffect(() => {
    if (latestStatus) {
      formStatus.setFieldsValue({ status: latestStatus?.latestStatus || 1 });
    }
  }, [latestStatus, formStatus]);

  useEffect(() => {
    const fetchData = async () => {
      setModalLoading(true);
      try {
        const response = await axiosInstance.get("patient/getAllStatus");
        if (response.status === 200 && response.data) {
          setAllStatus(response.data);
        }
      } catch (err) {
        notification.error({
          message: "Error Fetching Data",
          description: err.response
            ? `Server responded with status ${err.response.status}: ${
                err.response.data.message || "Unknown error"
              }`
            : "Unable to fetch status data. Please check your connection and try again.",
        });
      }
    };

    fetchData();
  }, []);

  const handleStatusFinish = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      console.log("record.surgery_case_id : ", record.surgery_case_id);
      console.log("status_id : ", values.status);
      console.log("updatedBy : ", user?.id);
      const response = await axiosInstance.patch(
        `surgery_case/status/${record.surgery_case_id}`,
        { status_id: values.status, updatedBy: user?.id || "system" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Status Updated",
          description: "The status has been updated successfully.",
        });
        onClose();
      }
    } catch (err) {
      notification.error({
        message: "Error Updating Status",
        description: err.response
          ? `Server responded with status ${err.response.status}: ${
              err.response.data.message || "Unknown error"
            }`
          : "Unable to update status. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (modalLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 min-h-44">
        <Spin spinning={modalLoading} size="large" />
      </div>
    );
  }

  return (
    <Form
      form={formStatus}
      onFinish={handleStatusFinish}
      layout="vertical"
      initialValues={{
        status: latestStatus?.latestStatus || 1,
      }}
    >
      <Form.Item
        name="status"
        label={
          <span className="text-lg font-medium text-gray-700">Status</span>
        }
      >
        <Select loading={loading} placeholder="Select a status">
          {allStatus.map((status) => (
            <Select.Option key={status.status_id} value={status.status_id}>
              {status.status_name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <div className="flex justify-center space-x-4 mb-6">
        <Button onClick={onClose} className="px-6 py-2 text-lg">
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-lg"
          loading={loading}
        >
          Update Status
        </Button>
      </div>
    </Form>
  );
};

export default StatusForm;
