import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import FullScreenLoading, {
  ORIconLoading,
} from "../components/FullScreenLoading";
import { axiosInstancePatient } from "../../admin/api/axiosInstance";
import { useTranslation } from "react-i18next";
import { usePatient } from "../context/PatientContext";
import AccessLinkError from "./accessLinkError";
import dayjs from "dayjs";
const PatientMain = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [lockUntil, setLockUntil] = useState(null);
  const [pinRemaining, setPinRemaining] = useState(null);
  const queryParams = new URLSearchParams(location.search);
  const { setSurgeryCase, setPatientLink, setPatient } = usePatient();
  const link = queryParams.get("link");

  useEffect(() => {
    const validateLink = async () => {
      try {
        setLoading(true);
        const response = await axiosInstancePatient.post(
          "patient/validate_link",
          { link }
        );
        if (!response.data.valid) {
          setErrorMessage(t("error.INVALID_LINK"));
        } else {
          setPatientLink(link);

          if (response.data.linkStatus?.lock_until) {
            setLockUntil(
              dayjs(response.data.linkStatus.lock_until)
                .add(7, "hour")
                .format("MM-DD-YYYY HH:mm:ss")
            );
          }

          if (response.data.linkStatus?.attempt_count) {
            setPinRemaining(response.data.linkStatus.attempt_count);
          }
        }
      } catch (error) {
        console.error("Error validating link:", error);
        setErrorMessage(t("error.FAILED_TO_VALIDATE_LINK"));
      } finally {
        setLoading(false);
      }
    };

    if (link) {
      validateLink();
    }
  }, [link, t, setPatientLink]);

  if (loading) {
    return (
      <FullScreenLoading loading={loading} t={t} icon={<ORIconLoading />} />
    );
  }

  if (errorMessage) {
    return <AccessLinkError errorMessage={errorMessage} />;
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-white">
      <div className="flex-1 w-full flex items-center justify-center px-0">
        <LoginForm
          t={t}
          link={link}
          lock_until={lockUntil}
          pinRemaining={pinRemaining}
        />
      </div>
    </div>
  );
};

export default PatientMain;
