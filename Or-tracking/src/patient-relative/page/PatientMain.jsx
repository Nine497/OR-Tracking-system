import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import warningCircle from "@iconify/icons-mdi/warning-circle";
import LoginForm from "../components/LoginForm";
import LanguageSelector from "../components/LanguageSelector";
import axiosInstance from "../../admin/api/axiosInstance";
import { useTranslation } from "react-i18next";
import Policy from "../components/Policy";
import { usePatient } from "../context/PatientContext";

const PatientMain = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const { setSurgeryCase, setPatientLink, patient_link } = usePatient();

  useEffect(() => {
    const validateToken = async () => {
      const link = queryParams.get("link");
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
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white">
        <LanguageSelector />
        <div className="w-full max-w-screen bg-white rounded-lg shadow-md">
          {!acceptedPolicy ? (
            <Policy t={t} handleAcceptPolicy={handleAcceptPolicy} />
          ) : responseData ? (
            <div className="w-full p-6 border-b border-gray-200">
              <h1 className="text-2xl md:text-3xl font-semibold text-center text-gray-800">
                {t("login.TITLE")}
              </h1>
              <div className="p-4 sm:p-6 md:p-8">
                <LoginForm t={t} queryParams={queryParams} />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex justify-center"></div>
      </div>
    </div>
  );
};

export default PatientMain;
