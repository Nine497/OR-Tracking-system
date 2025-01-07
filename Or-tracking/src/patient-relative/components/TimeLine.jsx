import React, { useMemo, useEffect } from "react";
import { Timeline, Tag, Typography, Card } from "antd";
import moment from "moment";
import { Icon } from "@iconify/react";

const { Text } = Typography;

const StatusTimeline = ({
  statusData,
  sortedStatuses,
  currentStatus,
  statusHistory,
  t,
}) => {
  useEffect(() => {
    console.log("currentStatus : ", currentStatus);
    console.log("statusHistory", statusHistory);
  }, [sortedStatuses, statusHistory]);

  const timelineItems = useMemo(() => {
    const statusMap = new Map(
      statusData
        .filter((status) => status.status_name !== "Pending")
        .map((status) => [status.status_id, status])
    );

    return statusData
      .filter((status) => status.status_name !== "Pending")
      .map((status) => {
        const historyEntry = sortedStatuses.find(
          (history) => history.status_id === status.status_id
        );

        const isRecoveryRoomStatus = currentStatus?.status_id === 5;
        const isLatestStatus =
          currentStatus?.status_id === status.status_id &&
          !isRecoveryRoomStatus;

        const isPastStatus =
          historyEntry &&
          (currentStatus?.status_id !== status.status_id ||
            isRecoveryRoomStatus);

        return {
          key: status.status_id,
          color: isLatestStatus ? "blue" : isPastStatus ? "green" : "gray",
          dot: isLatestStatus ? (
            <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 border-2 border-blue-500 transition-all duration-300 hover:scale-110">
              <Icon
                icon="material-symbols:pending"
                className="text-blue-500 text-lg md:text-xl"
              />
            </div>
          ) : isPastStatus ? (
            <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-100 border-2 border-green-500 transition-all duration-300 hover:scale-110">
              <Icon
                icon="material-symbols:check-circle"
                className="text-green-500 text-lg md:text-xl"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-100 border-2 border-gray-300 transition-all duration-300 hover:scale-110">
              <Icon
                icon="material-symbols:circle-outline"
                className="text-gray-500 text-lg md:text-xl"
              />
            </div>
          ),
          children: (
            <div className="flex flex-col">
              {historyEntry && (
                <Text className="font-semibold text-sm md:text-base text-gray-600 bg-gray-50 px-2 md:px-3 py-1 rounded-md w-fit mb-4">
                  {moment(historyEntry.updated_at).format("HH:mm DD/MM/YYYY")}
                </Text>
              )}
              <div className="flex flex-row items-center gap-2 md:gap-6">
                <Text
                  className={`text-sm md:text-base ${
                    isLatestStatus
                      ? "text-blue-600"
                      : isPastStatus
                      ? "text-green-600"
                      : "text-gray-600"
                  } font-medium flex-2`}
                >
                  {status.status_name}
                </Text>
                <div className="flex items-center flex-1 justify-end">
                  {isLatestStatus && (
                    <Tag
                      color="blue"
                      className="text-xs md:text-sm px-2 md:px-3 py-0.5 rounded-full font-normal"
                    >
                      {t("common.CURRENT")}
                    </Tag>
                  )}
                  {isPastStatus && (
                    <Tag
                      color="success"
                      className="text-xs md:text-sm px-2 md:px-3 py-0.5 rounded-full font-normal"
                    >
                      {t("common.COMPLETED")}
                    </Tag>
                  )}
                </div>
              </div>
              <div className="border-b border-gray-100 pt-3"></div>
            </div>
          ),
        };
      });
  }, [statusData, sortedStatuses, currentStatus, t]);

  return (
    <div className="px-5 pt-6">
      <Timeline
        items={timelineItems}
        className="max-w-3xl mx-auto"
        style={{
          "--timeline-item-padding": "20px",
        }}
      />
    </div>
  );
};

export default StatusTimeline;
