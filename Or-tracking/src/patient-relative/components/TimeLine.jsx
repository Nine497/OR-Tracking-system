import React, { useMemo, useEffect, useState } from "react";
import { Modal, Timeline, Tag, Typography, Rate, Input } from "antd";
import { FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import axiosInstance from "../../admin/api/axiosInstance";
import moment from "moment";
import { Icon } from "@iconify/react";

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

  const customIcons = {
    1: <FrownOutlined className="text-4xl  transition-all hover:scale-110" />,
    2: <FrownOutlined className="text-4xl  transition-all hover:scale-110" />,
    3: <MehOutlined className="text-4xl  transition-all hover:scale-110" />,
    4: <SmileOutlined className="text-4xl  transition-all hover:scale-110" />,
    5: <SmileOutlined className="text-4xl  transition-all hover:scale-110" />,
  };

  useEffect(() => {
    const checkReviewStatus = async () => {
      if (currentStatus?.status_id === 5) {
        try {
          const response = await axiosInstance.get(
            `/link_cases/check_reviews/${surgery_case_id}`
          );
          if (!response.data.reviewExists) {
            setIsModalVisible(true);
          }
        } catch (error) {
          console.error("Error checking review status:", error);
        }
      }
    };

    checkReviewStatus();
  }, [currentStatus, surgery_case_id]);

  const handleOk = async () => {
    try {
      await axiosInstance.post(`/link_cases/submit_review`, {
        surgery_case_id,
        review_text: suggestions,
        rating,
      });

      setIsModalVisible(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const timelineItems = useMemo(() => {
    const filteredStatusData = statusData.filter(
      (status) => status.status_name !== "Pending"
    );

    return filteredStatusData.map((status) => {
      const historyEntry = sortedStatuses.find(
        (history) => history.status_id === status.status_id
      );

      const isRecoveryRoomStatus = currentStatus?.status_id === 5;
      const isLatestStatus =
        currentStatus?.status_id === status.status_id && !isRecoveryRoomStatus;
      const isPastStatus =
        historyEntry &&
        (currentStatus?.status_id !== status.status_id || isRecoveryRoomStatus);

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
    <>
      <div className="px-5 pt-6">
        <Timeline items={timelineItems} className="max-w-3xl mx-auto" />
      </div>
      <Modal
        title={
          <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 pb-3 border-b">
            {t("review.review_title")}
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleOk}
              className="px-4 py-2 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white border border-blue-500 hover:border-blue-600 rounded-lg transition-colors w-full sm:w-auto"
            >
              {t("review.submit_review")}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              {t("review.later")}
            </button>
          </div>
        }
        width="90%"
        className="max-w-2xl"
        style={{
          content: {
            padding: "16px sm:24px",
            borderRadius: "12px",
          },
        }}
      >
        <div className="space-y-4 sm:space-y-6">
          <div>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-3 sm:mb-4">
              {t("review.review_prompt")}
            </p>
            <div className="flex justify-center items-center py-4 sm:py-6 px-3 sm:px-4 bg-gray-50 rounded-lg">
              <Rate
                defaultValue={rating}
                onChange={setRating}
                character={({ index }) => customIcons[index + 1]}
                className="flex justify-between w-full max-w-md"
              />
            </div>
          </div>

          <div>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-2 sm:mb-3">
              {t("review.additional_suggestions")}
            </p>
            <Input.TextArea
              onChange={(e) => setSuggestions(e.target.value)}
              rows={4}
              placeholder={t("review.suggestions_placeholder")}
              className="w-full resize-none rounded-lg text-sm sm:text-base"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StatusTimeline;
