import React, { useEffect, useState } from "react";
import { Select, Popconfirm, Button, notification } from "antd";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import "./StatusUpdateForm.css";

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
        setLoading(true);
        const response = await axiosInstanceStaff.get(
          `surgery_case/status/${record.surgery_case_id}`
        );
        if (response.status === 200 && response.data) {
          setSelectedStatus(response.data.latestStatus || 0);
          setTempStatus(response.data.latestStatus || 0);
        }
      } catch (err) {
        notification.error({
          message: "ไม่สามารถดึงข้อมูลสถานะได้ กรุณาลองใหม่อีกครั้ง",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      } finally {
        setLoading(false);
      }
    };

    if (record?.surgery_case_id) {
      fetchData();
    }
  }, [record]);

  const handleStatusChange = (value) => {
    setTempStatus(value);
  };

  const handleConfirmStatusUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axiosInstanceStaff.patch(
        `surgery_case/status/${record.surgery_case_id}`,
        { status_id: tempStatus, updatedBy: user?.id }
      );

      if (response.status === 200) {
        setSelectedStatus(tempStatus);
        notification.success({
          message: "สถานะถูกอัปเดตเรียบร้อยแล้ว",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
        if (onStatusUpdate) {
          onStatusUpdate(tempStatus);
        }
      }
    } catch (err) {
      setTempStatus(selectedStatus);
      notification.error({
        message: "ไม่สามารถดึงข้อมูลสถานะได้ กรุณาลองใหม่อีกครั้ง",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
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

  const filteredStatus = allStatus.filter(
    (status) => status.status_id <= selectedStatus + 1
  );

  return (
    <div className="flex items-center text-left space-x-2">
      <Select
        loading={loading}
        placeholder="Select a status"
        size="middle"
        className="w-full custom-select"
        value={tempStatus}
        onChange={handleStatusChange}
      >
        {allStatus.map((status) => (
          <Select.Option
            key={status.status_id}
            value={status.status_id}
            disabled={status.status_id > selectedStatus + 1}
            className="py-1"
          >
            {status.translated_name}
          </Select.Option>
        ))}
      </Select>

      <Popconfirm
        title="ยืนยันการอัพเดตสถานะ ?"
        open={showPopconfirm}
        onConfirm={handleConfirmStatusUpdate}
        onCancel={handleCancel}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
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
