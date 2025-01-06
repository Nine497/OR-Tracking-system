import React, { useEffect, useState, useMemo } from "react";
import { notification, Spin, Timeline, Typography } from "antd";
import axiosInstance from "../../api/axiosInstance";
import { Icon } from "@iconify/react";
import moment from "moment";

const { Text } = Typography;

const TimelineStatus = ({ record }) => {
  const [allStatus, setAllStatus] = useState([]);
  const [latestStatus, setLatestStatus] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

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
          console.log(response.data);

          setLatestStatus(response.data);
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
    const fetchStatusData = async () => {
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
      } finally {
        setModalLoading(false);
      }
    };

    fetchStatusData();
  }, []);

  const timelineItems = useMemo(() => {
    if (!allStatus.length || !latestStatus) return [];

    const passedStatusMap = new Map(
      latestStatus.statusHistory.map((history) => [
        history.status_id,
        history.updated_at,
      ])
    );

    return allStatus.map((status, index) => {
      const isPast = passedStatusMap.has(status.status_id);
      const updatedAt = passedStatusMap.get(status.status_id);
      const updatedBy = passedStatusMap.get(status.status_id);
      const isAlwaysBlue = status.status_id === 0;

      return {
        key: index,
        color: isAlwaysBlue || isPast ? "blue" : "gray",
        dot:
          isAlwaysBlue || isPast ? (
            <Icon icon="mdi:check-circle" />
          ) : (
            <Icon icon="mdi:circle-outline" />
          ),
        children: (
          <div>
            <Text className="text-base font-semibold">
              {status.status_name}
            </Text>
            <br />
            <Text>
              {isPast
                ? `Updated at: ${moment(updatedAt).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )} updatedBy :  ${updatedBy}`
                : status.description}
            </Text>
          </div>
        ),
      };
    });
  }, [allStatus, latestStatus]);

  if (modalLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 min-h-44">
        <Spin spinning={modalLoading} size="large" />
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
