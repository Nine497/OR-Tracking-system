import React, { useEffect, useState, useMemo } from "react";
import { Spin, Timeline, Typography, notification } from "antd";
import { Icon } from "@iconify/react";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Text } = Typography;

const TimelineStatus = ({ record }) => {
  const [allStatus, setAllStatus] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [latestStatus, setLatestStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (err) => {
    notification.error({
      message: "ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      showProgress: true,
      placement: "topRight",
      pauseOnHover: true,
      duration: 2,
    });
  };

  const createTimelineItem = (status, statusData, isPast) => {
    const updatedAt = statusData?.updated_at;
    const updatedByName = statusData
      ? `${statusData.staff_firstname} ${statusData.staff_lastname}`
      : null;

    return {
      color: isPast ? "blue" : "gray",
      dot: isPast ? (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white">
          <Icon icon="mdi:check-circle" className="w-4 h-4" />
        </div>
      ) : (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
          <Icon icon="mdi:circle-outline" className="w-4 h-4 text-gray-400" />
        </div>
      ),
      children: (
        <div className="ml-2 bg-white rounded-lg px-3 transition-colors duration-200">
          <Text className="text-base font-semibold text-gray-800">
            {status.translated_name}
          </Text>
          <div className="mt-2">
            {isPast ? (
              <div className="space-y-1">
                <div className="flex items-center text-gray-500">
                  <Icon icon="mdi:clock-outline" className="w-4 h-4 mr-2" />
                  <Text className="text-sm">
                    {dayjs(updatedAt)
                      .tz("Asia/Bangkok")
                      .format("DD/MM/YYYY, HH:mm")}
                  </Text>
                </div>
                <div className="flex items-center text-gray-500">
                  <Icon icon="mdi:account" className="w-4 h-4 mr-2" />
                  <Text className="text-sm">{updatedByName}</Text>
                </div>
              </div>
            ) : (
              <Text className="text-sm text-gray-600">
                {status.translated_des}
              </Text>
            )}
          </div>
        </div>
      ),
    };
  };

  useEffect(() => {
    const fetchSurgeryStatus = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstanceStaff.get(
          `surgery_case/status/${record.surgery_case_id}`
        );
        if (response.status === 200 && response.data) {
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
        const response = await axiosInstanceStaff.get(
          "patient/getAllStatus?language_code=th"
        );
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
    if (!allStatus.length || !statusHistory || latestStatus === null) return [];

    const passedStatusMap = new Map(
      statusHistory.map((history) => [
        history.status_id,
        {
          updated_at: history.updated_at,
          staff_firstname: history.staff_firstname,
          staff_lastname: history.staff_lastname,
        },
      ])
    );

    return allStatus.map((status) => {
      const isPast =
        (passedStatusMap.has(status.status_id) || status.status_id === 0) &&
        status.status_id <= latestStatus;
      const statusData = passedStatusMap.get(status.status_id);

      return createTimelineItem(status, statusData, isPast);
    });
  }, [allStatus, statusHistory, latestStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-[400px] bg-white p-6 rounded-lg">
      <Timeline items={timelineItems} className="px-4" />
    </div>
  );
};

export default TimelineStatus;
