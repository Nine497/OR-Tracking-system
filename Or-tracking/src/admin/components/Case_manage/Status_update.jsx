import React, { useEffect, useState } from "react";
import { Select, notification, Popconfirm, Button } from "antd";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const StatusUpdateForm = ({ record, allStatus, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [tempStatus, setTempStatus] = useState(null);
  const [showPopconfirm, setShowPopconfirm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    console.log("record", record);

    const fetchData = async () => {
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
          setSelectedStatus(response.data.latestStatus || 0);
          setTempStatus(response.data.latestStatus || 0);
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

    if (record?.surgery_case_id) {
      fetchData();
    }
  }, [record]);

  const handleStatusChange = (value) => {
    console.log(value);
    setTempStatus(value);
  };

  const handleConfirmStatusUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axiosInstance.patch(
        `surgery_case/status/${record.surgery_case_id}`,
        { status_id: tempStatus, updatedBy: user?.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSelectedStatus(tempStatus);
        notification.success({
          message: "Status Updated",
          description: "The status has been updated successfully.",
        });
        if (onStatusUpdate) {
          onStatusUpdate(tempStatus);
        }
      }
    } catch (err) {
      setTempStatus(selectedStatus);
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
      setShowPopconfirm(false);
    }
  };

  const handleCancel = () => {
    setTempStatus(selectedStatus);
    setShowPopconfirm(false);
  };

  const currentStatusName = allStatus.find(
    (status) => status.status_id === tempStatus
  )?.status_name;

  console.log("tempStatus:", tempStatus);
  console.log("selectedStatus:", selectedStatus);

  const hasStatusChanged = tempStatus !== selectedStatus;

  return (
    <div className="flex items-center space-x-2">
      <Select
        loading={loading}
        placeholder="Select a status"
        size="small"
        className="w-full"
        value={tempStatus}
        onChange={handleStatusChange}
        style={{
          maxWidth: "170px",
          minWidth: "170px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {allStatus.map((status) => (
          <Select.Option
            key={status.status_id}
            value={status.status_id}
            className="py-1"
          >
            {status.status_name}
          </Select.Option>
        ))}
      </Select>

      <Popconfirm
        title="Confirm Status Update ?"
        open={showPopconfirm}
        onConfirm={handleConfirmStatusUpdate}
        onCancel={handleCancel}
        okText="Yes"
        cancelText="No"
      >
        <Button
          type="primary"
          size="middle"
          disabled={!hasStatusChanged || loading}
          onClick={() => setShowPopconfirm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition-all duration-300 transform"
          loading={loading}
        >
          Save
        </Button>
      </Popconfirm>
    </div>
  );
};

export default StatusUpdateForm;
