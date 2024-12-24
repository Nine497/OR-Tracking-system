import React, { useEffect, useState } from "react";
import { usePatient } from "../context/PatientContext";
import { useNavigate } from "react-router-dom";
import { Timeline, Card, Avatar, Tag, Typography } from "antd";
import axiosInstance from "../../admin/api/axiosInstance";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";
import FullScreenLoading from "../components/FullScreenLoading";
import { useLoading } from "../hooks/useLoading";
import ManAvatar from "../assets/Man Avatar.png";
import WomanAvatar from "../assets/Woman Avatar.png";
import AccessLinkError from "./accessLinkError";
import { Icon } from "@iconify/react";
import moment from "moment";
import LogoutButton from "../components/LogoutButton";
import { motion } from "framer-motion";
import StatusTimeline from "../components/TimeLine";

const View = () => {
  const { patient_id, surgery_case_id, patient_link } = usePatient();
  const [patientData, setPatientData] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [isDataReady, setIsDataReady] = useState(false);
  const { Title, Text } = Typography;
  const { t } = useTranslation();
  const [showContent, setShowContent] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [sortedStatuses, setSortedStatuses] = useState([]);
  const [patient_currentStatus, setPatient_currentStatus] = useState([]);

  const {
    isLoading,
    showLoadingContent,
    isExiting,
    startLoading,
    exitLoading,
  } = useLoading();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        startLoading();
        if (!patient_id || !surgery_case_id || !patient_link) {
          console.log("Missing data:", {
            patient_id,
            surgery_case_id,
            patient_link,
          });
          setIsDataReady(false);
          return;
        }

        const [patientResponse, statusResponse, statusHisResponse] =
          await Promise.all([
            axiosInstance.post("patient/getPatientData", {
              surgery_case_id,
              patient_link,
            }),
            axiosInstance.get("patient/getAllStatus"),
            axiosInstance.get(`patient/getstatus/${surgery_case_id}`),
          ]);

        if (isMounted) {
          setPatientData(patientResponse.data);
          setStatusData(statusResponse.data);
          setStatusHistory(statusHisResponse.data);
          setErrorMessage("");
          setIsDataReady(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        if (error.response && error.response.status === 403) {
          setErrorMessage(t("error.LINK_INACTIVE"));
        } else {
          setErrorMessage(t("error.FAILED_TO_LOAD"));
        }
      } finally {
        if (isMounted) {
          setTimeout(() => {
            exitLoading();
          }, 1000);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [
    patient_id,
    surgery_case_id,
    patient_link,
    navigate,
    startLoading,
    exitLoading,
    t,
  ]);

  useEffect(() => {
    console.log("Full statusHistory:", statusHistory);

    if (statusHistory && Array.isArray(statusHistory.statusHistory)) {
      console.log(
        "Status History before processing:",
        statusHistory.statusHistory
      );

      // ค้นหาสถานะปัจจุบันจาก surgery_case_status_history_id
      const currentStatus = statusHistory.statusHistory.find(
        (history) =>
          history.surgery_case_status_history_id === statusHistory.latestStatus
      );

      console.log("Current Status:", currentStatus);

      // กรองเฉพาะ status ที่มี surgery_case_status_history_id น้อยกว่า latestStatus
      const filteredStatuses = statusHistory.statusHistory.filter(
        (history) => history.status_id < currentStatus.status_id
      );

      // ตรวจสอบว่า status_id ใดมี surgery_case_status_history_id มากที่สุด (ใหม่ที่สุด)
      const latestStatuses = filteredStatuses.reduce((acc, curr) => {
        if (
          !acc[curr.status_id] ||
          curr.surgery_case_status_history_id >
            acc[curr.status_id].surgery_case_status_history_id
        ) {
          acc[curr.status_id] = curr;
        }
        return acc;
      }, {});

      // แปลง Object เป็น Array และจัดเรียงตาม surgery_case_status_history_id จากใหม่ที่สุดไปเก่าที่สุด
      const sortedLatestStatuses = Object.values(latestStatuses).sort(
        (a, b) =>
          b.surgery_case_status_history_id - a.surgery_case_status_history_id
      );

      console.log("Filtered and Sorted Latest Statuses:", sortedLatestStatuses);

      // รวมสถานะปัจจุบันกับสถานะที่กรองและจัดเรียงแล้ว
      const finalStatuses = currentStatus
        ? [currentStatus, ...sortedLatestStatuses]
        : sortedLatestStatuses;

      console.log("Final Statuses including Current:", finalStatuses);

      setSortedStatuses(finalStatuses);
      setPatient_currentStatus(currentStatus);
    } else {
      console.log("statusHistory.statusHistory is not an array or is empty");
    }
  }, [statusHistory]);

  useEffect(() => {
    if (!isLoading && isDataReady) {
      setShowContent(true);
    }
  }, [isLoading, isDataReady]);

  if (errorMessage) {
    return <AccessLinkError errorMessage={errorMessage} t={t} />;
  }

  if (!patientData) {
    return null;
  }

  if (isLoading || !isDataReady) {
    return (
      <FullScreenLoading
        isLoading={isLoading}
        showLoadingContent={showLoadingContent}
        isExiting={isExiting}
        t={t}
      />
    );
  }

  const startTime = moment(
    `${moment().format("YYYY-MM-DD")} ${patientData.estimate_start_time}`,
    "YYYY-MM-DD HH:mm:ss"
  );
  const endTime = startTime
    .clone()
    .add(patientData.estimate_duration, "minutes");
  const formattedDate = moment(patientData.surgery_date).format("DD/MM/YYYY");

  return (
    <>
      <FullScreenLoading isLoading={isLoading} />

      <motion.div
        className="flex flex-col min-h-screen w-full relative font-normal text-base bg-slate-100"
        initial="hidden"
        animate={showContent ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        transition={{ duration: 0.6, ease: "easeIn" }}
      >
        <div className="flex flex-col min-h-screen w-full relative font-normal text-base bg-slate-100">
          <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-b-[50%_20%] z-0 opacity-90" />
          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-slate-100 z-0" />

          {/* Main Content */}
          <div className="relative z-10 container mx-auto px-4 pb-10">
            <div className="flex items-center justify-between py-6 px-4 md:px-6">
              <h1 className="font-semibold text-white text-2xl md:text-3xl lg:text-4xl tracking-tight">
                {t("or_tracking.TITLE")}
              </h1>

              <div className="flex items-center gap-3">
                <LanguageSelector t={t} />

                <LogoutButton />
              </div>
            </div>

            <div className="grid gap-6 max-w-3xl mx-auto">
              <Card
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                bordered={false}
                styles={{ body: { padding: "1.5rem" } }}
              >
                <div className="flex flex-row sm:flex-row items-center sm:items-start gap-6">
                  <Avatar
                    src={ManAvatar}
                    size={96}
                    icon={
                      <Icon
                        icon="mdi:account-circle-outline"
                        className="text-gray-500"
                        style={{ fontSize: "48px" }}
                      />
                    }
                    className="border-2 border-gray-200"
                  />
                  <div className="flex flex-col gap-3 flex-grow">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Tag
                          color="blue"
                          className="m-0 text-base sm:text-lg font-medium"
                        >
                          {t("patient.HN")} : {patientData.hn_code}
                        </Tag>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Text className="font-medium text-gray-700 min-w-[10px] text-base sm:text-xl">
                          {t("patient.NAME")}:
                        </Text>
                        <Text className="text-base sm:text-xl font-normal">
                          {patientData.patient_first_name}{" "}
                          {patientData.patient_last_name}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Text
                          strong
                          className="text-gray-700 min-w-[10px] text-base sm:text-xl"
                        >
                          {t("patient.GENDER")}:
                        </Text>
                        <Text className="text-base sm:text-xl font-normal">
                          {patientData.gender}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                bordered={false}
                styles={{ body: { padding: "1.5rem" } }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="mdi:stethoscope"
                      className="text-blue-500 text-xl sm:text-2xl"
                    />
                    <div className="flex flex-wrap gap-2 items-center">
                      <Text
                        strong
                        className="text-gray-700 text-base sm:text-xl"
                      >
                        {t("patient.SURGEON")}:
                      </Text>
                      <Text className="text-base sm:text-2xl font-normal">
                        {patientData.doctor_first_name}{" "}
                        {patientData.doctor_last_name}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Icon
                      icon="mdi:hospital-marker"
                      className="text-blue-500 text-xl sm:text-2xl"
                    />
                    <div className="flex flex-wrap gap-2 items-center">
                      <Text
                        strong
                        className="text-gray-700 text-base sm:text-xl"
                      >
                        {t("patient.ROOM")}:
                      </Text>
                      <Text className="text-base sm:text-2xl font-normal">
                        {patientData.room_name}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Icon
                      icon="mdi:calendar-today"
                      className="text-blue-500 text-xl sm:text-2xl"
                    />
                    <div className="flex flex-wrap gap-2 items-center">
                      <Text
                        strong
                        className="text-gray-700 text-base sm:text-xl"
                      >
                        {t("patient.SURGERY_DATE")}:
                      </Text>
                      <Text className="text-base sm:text-2xl font-normal">
                        {formattedDate}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Icon
                      icon="mdi:clock-time-four"
                      className="text-blue-500 text-xl sm:text-2xl"
                    />
                    <div className="flex flex-wrap gap-2 items-center">
                      <Text
                        strong
                        className="text-gray-700 text-base sm:text-xl"
                      >
                        {t("patient.SURGERY_TIME")}:
                      </Text>
                      <Text className="text-base sm:text-2xl font-normal">
                        {startTime.format("HH:mm")} - {endTime.format("HH:mm")}
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                bordered={false}
                styles={{ body: { padding: "1.5rem" } }}
              >
                <Title
                  level={4}
                  className="mb-6 text-gray-800 font-semibold text-base sm:text-2xl"
                >
                  {t("timeline.TITLE")}
                </Title>
                <div className="p-4">
                  <StatusTimeline
                    statusData={statusData}
                    sortedStatuses={sortedStatuses}
                    statusHistory={statusHistory}
                    currentStatus={patient_currentStatus}
                    t={t}
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default View;
