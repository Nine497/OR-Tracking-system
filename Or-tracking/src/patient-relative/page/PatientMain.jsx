import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import FullScreenLoading, {
  ORIconLoading,
} from "../components/FullScreenLoading";
import { axiosInstancePatient } from "../../admin/api/axiosInstance";
import { useTranslation } from "react-i18next";
import Policy from "../components/Policy";
import { usePatient } from "../context/PatientContext";
import AccessLinkError from "./accessLinkError";

const PatientMain = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const queryParams = new URLSearchParams(location.search);
  const { setSurgeryCase, setPatientLink, setPatient } = usePatient();
  const link = queryParams.get("link");

  useEffect(() => {
    const validateLink = async () => {
      try {
        setLoading(true);
        const response = await axiosInstancePatient.post(
          "patient/validate_link",
          {
            link: link,
          }
        );

        if (!response.data.valid) {
          setErrorMessage(t("error.INVALID_LINK"));
        } else {
          setPatientLink(link);
          setPatientLink(link);
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
  }, [link, t, setPatientLink, setPatientLink]);

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
      <div className="w-full max-w-7xl px-4 h-full flex flex-col items-center">
        <div className="flex-1 w-full flex items-center justify-center px-0">
          <div className="w-full max-w-md">
            <LoginForm t={t} link={link} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientMain;
