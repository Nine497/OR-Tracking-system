import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Result, Button } from "antd";
import { Icon } from "@iconify/react";
import LoginForm from "../components/LoginForm";
import LanguageSelector from "../components/LanguageSelector";
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
  const queryParams = new URLSearchParams(location.search);
  const { setSurgeryCase, setPatientLink, patient_link } = usePatient();
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
          setResponseData(response.data);
          console.log(response.data);
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (errorMessage) {
    return <AccessLinkError errorMessage={errorMessage} t={t} />;
  }

  return (
    <>
      {!acceptedPolicy ? (
        <Policy t={t} handleAcceptPolicy={handleAcceptPolicy} />
      ) : responseData ? (
        <div className="h-screen w-full flex items-center justify-center bg-white overflow-hidden">
          <div className="w-full h-full flex flex-col items-center">
            <div className="flex-1 w-full flex items-center justify-center px-4">
              <div className="w-full">
                <div className="w-full">
                  <div className="p-4">
                    <LoginForm t={t} link={link} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default PatientMain;
