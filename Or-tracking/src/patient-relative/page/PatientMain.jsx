import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import warningCircle from "@iconify/icons-mdi/warning-circle";
import LoginForm from "../components/LoginForm";
import LanguageSelector from "../components/LanguageSelector";
import axiosInstance from "../../admin/api/axiosInstance";
import { useTranslation } from "react-i18next";
import Policy from "../components/Policy";

const PatientMain = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const queryParams = new URLSearchParams(location.search);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = queryParams.get("token");

      if (!token) {
        setErrorMessage(t("errors.NO_TOKEN_PROVIDED"));
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.post("patient/validate-token", {
          token,
        });
        if (response.data.valid) {
          setResponseData(response.data);
        }
      } catch (error) {
        setErrorMessage(error.response?.data?.error);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [location]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-screen bg-white rounded-lg shadow-md">
          {errorMessage ? (
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <span className="inline-block text-5xl sm:text-6xl md:text-7xl text-red-500 mb-4">
                <Icon icon={warningCircle} />
              </span>
              <h2 className="text-xl sm:text-2xl text-red-500 font-semibold mb-4">
                {t(`errors.${errorMessage}`)}
              </h2>
              <p className="text-base sm:text-lg text-gray-700">
                {t("Please contact staff for more details.")}
              </p>
            </div>
          ) : !acceptedPolicy ? (
            <Policy t={t} handleAcceptPolicy={handleAcceptPolicy} />
          ) : responseData ? (
            <>
              <div className="w-full p-6 border-b border-gray-200">
                <h1 className="text-2xl md:text-3xl font-semibold text-center text-gray-800">
                  {t("login.TITLE")}
                </h1>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                <LoginForm t={t} queryParams={queryParams} />
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-6 flex justify-center">
          <LanguageSelector changeLanguage={changeLanguage} />
        </div>
      </div>
    </div>
  );
};

export default PatientMain;
