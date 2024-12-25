import React, { useEffect, useState } from "react";
import { usePatient } from "../context/PatientContext";
import { useNavigate } from "react-router-dom";
import { Card, Avatar, Tag, Typography } from "antd";
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
import { UserOutlined } from "@ant-design/icons";

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
  const { isLoading, startLoading, exitLoading } = useLoading();

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

      const currentStatus = statusHistory.statusHistory.find(
        (history) =>
          history.surgery_case_status_history_id === statusHistory.latestStatus
      );

      console.log("Current Status:", currentStatus);

      const filteredStatuses = statusHistory.statusHistory.filter(
        (history) => history.status_id < currentStatus.status_id
      );

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

      const sortedLatestStatuses = Object.values(latestStatuses).sort(
        (a, b) =>
          b.surgery_case_status_history_id - a.surgery_case_status_history_id
      );

      console.log("Filtered and Sorted Latest Statuses:", sortedLatestStatuses);

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
    return <AccessLinkError errorMessage={errorMessage} />;
  }

  if (!patientData) {
    return null;
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
      <FullScreenLoading isLoading={isLoading} t={t} />

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

            <div className="grid gap-6 w-full max-w-xl mx-auto">
              <Card
                className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                bordered={false}
                styles={{
                  body: {
                    padding: 0,
                  },
                }}
              >
                {/* Header Section */}
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                  <Title level={4} className="text-xl sm:text-2xl m-0">
                    {t("view.patient_information")}
                  </Title>
                </div>

                {/* Content Section */}
                <div className="flex flex-row gap-5 items-center w-full p-5 sm:gap-0">
                  <div className="w-3/6 sm:w-3/5 flex flex-col items-center">
                    {/* Avatar Section */}
                    <div className="flex justify-center items-center mb-4">
                      <div className="relative group">
                        <Avatar
                          src={ManAvatar}
                          size={96}
                          icon={
                            <UserOutlined className="text-gray-500 text-4xl" />
                          }
                          className="border-4 border-gray-100 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:border-blue-100"
                        />
                      </div>
                    </div>

                    {/* HN Section */}
                    <div className="flex justify-center items-center">
                      <Tag
                        color="blue"
                        className="text-sm sm:text-lg font-medium px-1 py-1"
                      >
                        {t("patient.HN")}: {patientData.hn_code}
                      </Tag>
                    </div>
                  </div>

                  <div className="w-4/6 sm:w-2/5">
                    {/* Patient Name Section */}
                    <div className="flex flex-col items-start space-y-2 mb-4">
                      <Text className="text-gray-400 text-sm font-semibold">
                        {t("patient.NAME")}
                      </Text>
                      <Text className="text-base sm:text-lg font-medium">
                        {patientData.patient_first_name}{" "}
                        {patientData.patient_last_name}
                      </Text>
                    </div>

                    {/* Patient Gender Section */}
                    <div className="flex flex-col items-start space-y-2">
                      <Text className="text-gray-500 text-sm font-semibold">
                        {t("patient.GENDER")}
                      </Text>
                      <Text className="text-base sm:text-lg font-medium">
                        {patientData.gender}
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                bordered={false}
                styles={{
                  body: {
                    padding: 0,
                  },
                }}
              >
                {/* Header Section */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <Title level={4} className="text-xl sm:text-2xl m-0">
                    {t("view.surgery_information")}
                  </Title>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Surgeon Info */}
                    <div className="group p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Icon
                            icon="mdi:stethoscope"
                            className="text-blue-500 text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <Text strong className="text-gray-500 text-sm block">
                            {t("patient.SURGEON")}
                          </Text>
                          <Text className="text-base sm:text-lg block font-medium">
                            {patientData.doctor_first_name}{" "}
                            {patientData.doctor_last_name}
                          </Text>
                        </div>
                      </div>
                    </div>

                    {/* Room Info */}
                    <div className="group p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Icon
                            icon="mdi:hospital-marker"
                            className="text-blue-500 text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <Text strong className="text-gray-500 text-sm block">
                            {t("patient.ROOM")}
                          </Text>
                          <Text className="text-base sm:text-lg block font-medium">
                            {patientData.room_name}
                          </Text>
                        </div>
                      </div>
                    </div>

                    {/* Date Info */}
                    <div className="group p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Icon
                            icon="mdi:calendar-today"
                            className="text-blue-500 text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <Text strong className="text-gray-500 text-sm block">
                            {t("patient.SURGERY_DATE")}
                          </Text>
                          <Text className="text-base sm:text-lg block font-medium">
                            {formattedDate}
                          </Text>
                        </div>
                      </div>
                    </div>

                    {/* Time Info */}
                    <div className="group p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Icon
                            icon="mdi:clock-time-four"
                            className="text-blue-500 text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <Text strong className="text-gray-500 text-sm block">
                            {t("patient.SURGERY_TIME")}
                          </Text>
                          <Text className="text-base sm:text-lg block font-medium">
                            {startTime.format("HH:mm")} -{" "}
                            {endTime.format("HH:mm")}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                bordered={false}
                styles={{
                  body: {
                    padding: 0,
                  },
                }}
              >
                <div className="px-6 py-4 border-b border-gray-100">
                  <Title
                    level={4}
                    className="text-gray-800 font-semibold text-base sm:text-2xl"
                  >
                    {t("view.surgery_timeline")}
                  </Title>
                </div>
                <div className="flex flex-col items-start mt-8 m-4">
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
