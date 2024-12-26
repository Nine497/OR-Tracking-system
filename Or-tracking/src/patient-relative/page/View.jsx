import React, { useEffect, useState } from "react";
import { usePatient } from "../context/PatientContext";
import { useNavigate } from "react-router-dom";
import { Card, Avatar, Tag, Typography } from "antd";
import axiosInstance from "../../admin/api/axiosInstance";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";
import FullScreenLoading, {
  ORIconLoading,
} from "../components/FullScreenLoading";
import { useLoading } from "../hooks/useLoading";
import ManAvatar from "../assets/Man Avatar.png";
import WomanAvatar from "../assets/Woman Avatar.png";
import AccessLinkError from "./accessLinkError";
import { Icon } from "@iconify/react";
import moment from "moment";
import LogoutButton from "../components/LogoutButton";
import { motion, time } from "framer-motion";
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
  const { t, i18n } = useTranslation();
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
            axiosInstance.get(`patient/getStatus/${surgery_case_id}`),
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
    console.log(patientData);

    let timeout;
    if (!isLoading && isDataReady) {
      timeout = setTimeout(() => {
        setShowContent(true);
      }, 100);
    } else {
      setShowContent(false);
    }
    return () => clearTimeout(timeout);
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
      {isLoading ? (
        <FullScreenLoading loading={isLoading} t={t} icon={<ORIconLoading />} />
      ) : (
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
            <div className="absolute top-0 left-0 right-0 h-1/5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-b-[50%_20%] z-0 opacity-90" />
            <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-slate-100 z-0" />

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

              <div className="grid gap-3 w-full max-w-xl mx-auto">
                <Card
                  className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-2xl"
                  bordered={false}
                  styles={{
                    body: {
                      padding: 0,
                    },
                  }}
                >
                  <div className="flex flex-row gap-5 items-center w-full h-auto p-5 sm:gap-0">
                    {/* Avatar Section */}
                    <div className="w-3/6 sm:w-2/4 flex flex-col justify-center items-center">
                      <Avatar
                        src={ManAvatar}
                        icon={
                          <UserOutlined className="text-gray-500 text-4xl" />
                        }
                        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 border-4 border-gray-100 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:border-blue-100"
                      />
                    </div>

                    {/* Text Section */}
                    <div className="flex flex-col justify-center w-4/6 space-y-2 sm:w-2/4">
                      <Text className="text-black text-sm font-medium sm:text-lg">
                        {t("patient.HN")} : {patientData.hn_code}
                      </Text>
                      <Text className="text-black text-sm font-medium sm:text-lg">
                        {t("patient.NAME")} : {patientData.patient_first_name}{" "}
                        {patientData.patient_last_name}
                      </Text>
                      <Text className="text-black text-sm font-medium sm:text-lg">
                        {t("patient.GENDER")} : {patientData.gender}
                      </Text>
                      <Text className="text-black text-sm font-medium sm:text-lg">
                        Patient Rights :
                      </Text>
                    </div>
                  </div>
                </Card>

                <Card
                  className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-2xl"
                  bordered={false}
                  styles={{
                    body: {
                      padding: 0,
                    },
                  }}
                >
                  <div className=" flex justify-center items-center px-6 py-4 h-full sm:mx-4">
                    <div className="gap-1 flex flex-col space-y-2 w-full max-w-3xl mx-auto">
                      <Text className="text-black text-sm font-medium sm:text-lg">
                        {t("patient.SURGEON")} : {patientData.doctor_first_name}{" "}
                        {patientData.doctor_last_name}
                      </Text>
                      <Text className="text-black text-sm font-medium sm:text-lg">
                        {t("patient.ROOM")} : {patientData.room_name}
                      </Text>
                      <Text className="text-black text-sm font-medium sm:text-lg">
                        {t("patient.SURGERY_DATE")} : {formattedDate}
                      </Text>
                      <div className="inline-flex items-center bg-blue-50 p-2 text-sm font-medium sm:text-lg rounded-md space-x-2">
                        <span className="text-black font-medium">
                          {t("patient.SURGERY_START_TIME")}{" "}
                        </span>
                        <Icon icon="tabler:clock" className="text-black" />
                        <span className="text-blue-500 font-medium">
                          {startTime.format("HH:mm")}{" "}
                        </span>
                        <span className="text-black font-medium">
                          {t("patient.SURGERY_FINSIH_TIME")}{" "}
                        </span>
                        <Icon icon="tabler:clock" className="text-black" />
                        <span className="text-blue-500 font-medium">
                          {endTime.format("HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="text-gray-800 font-semibold text-base pt-2 sm:text-2xl mb-0">
                  {t("view.surgery_timeline")}
                </div>

                <Card
                  className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-2xl"
                  bordered={false}
                  styles={{
                    body: {
                      padding: 0,
                    },
                  }}
                >
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
      )}
    </>
  );
};

export default View;
