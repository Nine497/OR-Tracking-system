import React, { useMemo, useEffect } from "react";
import { Timeline, Tag, Typography } from "antd";
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
    console.log("sortedStatuses", sortedStatuses);
    console.log("statusHistory", statusHistory);
  }, [sortedStatuses, statusHistory]);

  const timelineItems = useMemo(() => {
    const statusMap = new Map(
      statusData.map((status) => [status.status_id, status])
    );

    return statusData.map((status) => {
      const historyEntry = sortedStatuses.find(
        (history) => history.status_id === status.status_id
      );

      const isLatestStatus =
        currentStatus?.status_id === status.status_id &&
        currentStatus?.status_name !== "Patient returned to the recovery room";

      const isPastStatus =
        historyEntry &&
        (!isLatestStatus ||
          currentStatus?.status_name ===
            "Patient returned to the recovery room");

      return {
        key: status.status_id,
        color: isLatestStatus ? "blue" : isPastStatus ? "green" : "gray",
        className: `${
          isLatestStatus
            ? "[&>.ant-timeline-item-tail]:!border-blue-500"
            : isPastStatus
            ? "[&>.ant-timeline-item-tail]:!border-green-500"
            : "[&>.ant-timeline-item-tail]:!border-gray-300"
        }`,
        dot: isLatestStatus ? (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-500">
            <Icon
              icon="material-symbols:pending"
              className="text-blue-500 text-xl"
            />
          </div>
        ) : isPastStatus ? (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 border-2 border-green-500">
            <Icon
              icon="material-symbols:check-circle"
              className="text-green-500 text-xl"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-300">
            <Icon
              icon="material-symbols:circle-outline"
              className="text-gray-500 text-xl"
            />
          </div>
        ),
        children: (
          <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            {historyEntry && (
              <Text className="font-medium text-sm sm:text-base text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md w-fit md:min-w-[160px]">
                {moment(historyEntry.updated_at).format("HH:mm DD/MM/YYYY")}
              </Text>
            )}

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <Text
                strong
                className={`text-sm sm:text-base ${
                  isLatestStatus
                    ? "text-blue-600"
                    : isPastStatus
                    ? "text-green-600"
                    : "text-gray-600"
                } font-semibold`}
              >
                {status.status_name}
              </Text>

              <div className="flex items-center gap-2">
                {isLatestStatus && (
                  <Tag
                    color="blue"
                    className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-0.5 sm:py-1 rounded-full shadow-sm"
                  >
                    {t("common.CURRENT")}
                  </Tag>
                )}
                {isPastStatus && (
                  <Tag
                    color="success"
                    className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-0.5 sm:py-1 rounded-full shadow-sm"
                  >
                    {t("common.COMPLETED")}
                  </Tag>
                )}
              </div>
            </div>
          </div>
        ),
      };
    });
  }, [statusData, sortedStatuses, currentStatus, t]);

  return (
    <div className="p-4">
      <Timeline items={timelineItems} className="max-w-3xl mx-auto" />
    </div>
  );
};

export default StatusTimeline;
