import React, { useEffect, useState, useMemo } from "react";
import { notification, Spin, Timeline, Typography } from "antd";
import { Icon } from "@iconify/react";
import moment from "moment";
import axiosInstance from "../../api/axiosInstance";

const { Text } = Typography;

const TimelineStatus = ({ record }) => {
  const [allStatus, setAllStatus] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [latestStatus, setLatestStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (err) => {
    notification.error({
      message: "Error Fetching Data",
      description: err.response
        ? `Server responded with status ${err.response.status}: ${
            err.response.data.message || "Unknown error"
          }`
        : "Unable to fetch status data. Please check your connection and try again.",
    });
  };

  const createTimelineItem = (status, statusData, isPast, isAlwaysBlue) => {
    const updatedAt = statusData?.updated_at;
    const updatedByName = statusData
      ? `${statusData.staff_firstname} ${statusData.staff_lastname}`
      : null;

    return {
      color: isAlwaysBlue || isPast ? "blue" : "gray",
      dot:
        isAlwaysBlue || isPast ? (
          <Icon icon="mdi:check-circle" />
        ) : (
          <Icon icon="mdi:circle-outline" />
        ),
      children: (
        <div>
          <Text className="text-base font-semibold">{status.status_name}</Text>
          <br />
          <Text>
            {isPast ? (
              <div className="flex flex-col space-y-1">
                <Text className="text-sm text-gray-500">
                  Updated at : {moment(updatedAt).format("DD/MM/YYYY, HH:mm")}
                </Text>
                <Text className="text-sm text-gray-500">
                  By : {updatedByName}
                </Text>
              </div>
            ) : (
              <Text className="text-sm text-gray-600">
                {status.description}
              </Text>
            )}
          </Text>
        </div>
      ),
    };
  };

  useEffect(() => {
    const fetchSurgeryStatus = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get(
          `surgery_case/status/${record.surgery_case_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.status === 200 && response.data) {
          console.log(response.data);
          setStatusHistory(response.data.statusHistory);
          setLatestStatus(response.data.latestStatus);
        }
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurgeryStatus();
  }, [record]);

  useEffect(() => {
    const fetchAllStatuses = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("patient/getAllStatus");
        if (response.status === 200 && response.data) {
          setAllStatus(response.data);
        }
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllStatuses();
  }, []);

  const timelineItems = useMemo(() => {
    if (!allStatus.length || !statusHistory || !latestStatus) return [];
    console.log("latestStatus : ", latestStatus);
    console.log("statusHistory : ", statusHistory);
    const passedStatusMap = new Map(
      statusHistory
        .filter((history) => history.status_id <= latestStatus)
        .map((history) => [
          history.status_id,
          {
            updated_at: history.updated_at,
            staff_firstname: history.staff_firstname,
            staff_lastname: history.staff_lastname,
          },
        ])
    );

    return allStatus.map((status) => {
      const isPast = passedStatusMap.has(status.status_id);
      const statusData = passedStatusMap.get(status.status_id);
      const isAlwaysBlue = status.status_id === 0;

      return createTimelineItem(status, statusData, isPast, isAlwaysBlue);
    });
  }, [allStatus, statusHistory, latestStatus]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 min-h-44">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-[400px] px-4 py-6">
      <Timeline items={timelineItems} className="px-4" />
    </div>
  );
};

export default TimelineStatus;
