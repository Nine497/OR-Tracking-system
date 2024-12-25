import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import FullScreenLoading from "../components/FullScreenLoading";
import axiosInstance from "../../admin/api/axiosInstance";
import { useTranslation } from "react-i18next";
import Policy from "../components/Policy";
import { usePatient } from "../context/PatientContext";
import AccessLinkError from "./accessLinkError";

const PatientMain = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);
  const queryParams = new URLSearchParams(location.search);
  const { setSurgeryCase, setPatientLink, setPatient } = usePatient();
  const link = queryParams.get("link");

  useEffect(() => {
    const validateToken = async () => {
      if (!link) {
        setErrorMessage(t("errors.NO_TOKEN_PROVIDED"));
        setLoading(false);
        return;
      }

      try {
        setPatientLink(link);
        const response = await axiosInstance.post("patient/validate_link", {
          link,
        });
        if (response.data.valid) {
          setSurgeryCase(response.data.surgery_case_id);
          setPatient(response.data.patient_id);
          setResponseData(response.data);
        } else {
          setErrorMessage(t("errors.INVALID_TOKEN"));
        }
      } catch (error) {
        setErrorMessage(
          error.response?.data?.error || t("errors.SERVER_ERROR")
        );
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const handleAcceptPolicy = () => {
    setAcceptedPolicy(true);
    setModalVisible(false);
  };

  const handleDeclinePolicy = () => {
    setErrorMessage(t("errors.POLICY_DECLINED"));
    setModalVisible(false);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  if (loading) {
    return <FullScreenLoading isLoading={loading} />;
  }

  if (errorMessage) {
    return <AccessLinkError errorMessage={errorMessage} />;
  }

  return (
    responseData && (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-full h-full flex flex-col items-center">
          <Policy
            t={t}
            handleAcceptPolicy={handleAcceptPolicy}
            handleDeclinePolicy={handleDeclinePolicy}
            visible={modalVisible}
            handleCloseModal={handleCloseModal}
          />
          <div className="flex-1 flex items-center justify-center w-full px-10">
            <LoginForm t={t} link={link} />
          </div>
        </div>
      </div>
    )
  );
};

export default PatientMain;
