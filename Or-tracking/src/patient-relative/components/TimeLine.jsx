import React, { useMemo, useEffect, useState, useCallback } from "react";
import { Modal, Timeline, Tag, Typography, Rate, Input } from "antd";
import { FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import { axiosInstancePatient } from "../../admin/api/axiosInstance";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Text } = Typography;

const StatusTimeline = ({
  statusData,
  sortedStatuses,
  currentStatus,
  statusHistory,
  t,
  surgery_case_id,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);

  const customIcons = {
    1: <FrownOutlined className="text-4xl transition-all hover:scale-110" />,
    2: <FrownOutlined className="text-4xl transition-all hover:scale-110" />,
    3: <MehOutlined className="text-4xl transition-all hover:scale-110" />,
    4: <SmileOutlined className="text-4xl transition-all hover:scale-110" />,
    5: <SmileOutlined className="text-4xl transition-all hover:scale-110" />,
  };

  useEffect(() => {
    (async () => {
      if (currentStatus?.status_id === 5) {
        try {
          const response = await axiosInstancePatient.get(
            `/link_cases/check_reviews/${surgery_case_id}`
          );
          if (!response.data.reviewExists) {
            setIsModalVisible(true);
          }
        } catch (error) {
          console.error("Error checking review status:", error);
        }
      }
    })();
  }, [currentStatus, surgery_case_id]);

  const handleOk = useCallback(async () => {
    setLoading(true);
    try {
      await axiosInstancePatient.post(`/link_cases/submit_review`, {
        surgery_case_id,
        review_text: suggestions,
        rating,
      });
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setLoading(false);
    }
  }, [surgery_case_id, suggestions, rating]);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const timelineItems = useMemo(() => {
    return statusData
      .filter((status) => status.status_id !== 0)
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

        // ตรวจสอบว่าเป็นสถานะสำเร็จหรือไม่ (status_id = 4) และต้องเป็น LatestStatus
        const isSuccessStatus = status.status_id === 4 && isLatestStatus;

        // ถ้าเป็น status_id = 4 และเป็น LatestStatus ให้ให้สถานะเป็น success
        const finalColor = isSuccessStatus
          ? "success"
          : isLatestStatus
          ? "blue"
          : isPastStatus
          ? "green"
          : "gray";

        const finalDotClass = isSuccessStatus
          ? "bg-green-100 border-2 border-green-500"
          : isLatestStatus
          ? "bg-blue-100 border-2 border-blue-500"
          : isPastStatus
          ? "bg-green-100 border-2 border-green-500"
          : "bg-gray-100 border-2 border-gray-300";

        const finalIcon = isSuccessStatus
          ? "material-symbols:check-circle"
          : isLatestStatus
          ? "material-symbols:pending"
          : isPastStatus
          ? "material-symbols:check-circle"
          : "material-symbols:circle-outline";

        return {
          key: status.status_id,
          color: finalColor,
          dot: (
            <div
              className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full transition-all duration-300 hover:scale-110 ${finalDotClass}`}
            >
              <Icon
                icon={finalIcon}
                className={`${
                  isSuccessStatus
                    ? "text-green-500"
                    : isLatestStatus
                    ? "text-blue-500"
                    : isPastStatus
                    ? "text-green-500"
                    : "text-gray-500"
                } text-lg md:text-xl`}
              />
            </div>
          ),
          children: (
            <div className="flex flex-col">
              {historyEntry && (
                <Text className="font-semibold text-sm md:text-base text-gray-600 bg-gray-50 px-2 md:px-3 py-1 rounded-md w-fit mb-2">
                  {dayjs(historyEntry.updated_at)
                    .tz("Asia/Bangkok")
                    .format("DD/MM/YYYY, HH:mm")}
                </Text>
              )}
              <div className="flex flex-row justify-between gap-2 md:gap-6">
                <div className="flex flex-col gap-1 mb-2">
                  <Text
                    className={`text-sm md:text-base ${
                      isSuccessStatus
                        ? "text-green-600"
                        : isLatestStatus
                        ? "text-blue-600"
                        : isPastStatus
                        ? "text-green-600"
                        : "text-gray-600"
                    } font-medium flex-2`}
                  >
                    {status.translated_name}
                  </Text>
                  <Text
                    className={`text-xs md:text-base ${
                      isSuccessStatus
                        ? "text-green-300"
                        : isLatestStatus
                        ? "text-blue-300"
                        : isPastStatus
                        ? "text-green-300"
                        : "text-gray-300"
                    } font-medium flex-2`}
                  >
                    {status.translated_des}
                  </Text>
                </div>
                {isSuccessStatus && (
                  <Tag color="success" className="h-fit">
                    {t("common.COMPLETED")}
                  </Tag>
                )}
                {isLatestStatus && !isSuccessStatus && (
                  <Tag color="blue" className="h-fit">
                    {t("common.CURRENT")}
                  </Tag>
                )}
                {isPastStatus && !isSuccessStatus && (
                  <Tag color="success" className="h-fit">
                    {t("common.COMPLETED")}
                  </Tag>
                )}
              </div>
              <div className="border-b border-gray-100 "></div>
            </div>
          ),
        };
      });
  }, [statusData, sortedStatuses, currentStatus, t]);

  return (
    <>
      <div className="px-2 pt-6 w-full">
        {currentStatus?.status_id === 0 ? (
          <div className="text-center p-4 sm:p-6">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
              {t("view.pending_title")}
            </p>
            <p className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-600 mt-2 leading-relaxed">
              {t("view.pending_des")}
            </p>
          </div>
        ) : (
          <>
            {currentStatus && (
              <>
                <Timeline items={timelineItems} className="max-w-3xl mx-auto" />
              </>
            )}
          </>
        )}
      </div>

      <Modal
        title={
          <div className="text-lg font-semibold">
            {t("review.review_title")}
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        footer={
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <button
              onClick={handleOk}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-full sm:w-auto"
            >
              {loading ? t("review.submitting") : t("review.submit_review")}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
            >
              {t("review.later")}
            </button>
          </div>
        }
        width="90%"
        className="max-w-2xl"
      >
        <p className="text-gray-700">{t("review.review_prompt")}</p>
        <div className="flex justify-center py-4">
          <Rate
            value={rating}
            onChange={setRating}
            character={({ index }) => customIcons[index + 1]}
            className="flex justify-between w-full max-w-md"
          />
        </div>
        <Input.TextArea
          value={suggestions}
          onChange={(e) => setSuggestions(e.target.value)}
          rows={4}
          placeholder={t("review.suggestions_placeholder")}
        />
      </Modal>
    </>
  );
};

export default StatusTimeline;
