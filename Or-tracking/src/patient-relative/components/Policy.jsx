import React from "react";
import { Button } from "antd";
import { Icon } from "@iconify/react";
import LanguageSelector from "./LanguageSelector";

const Policy = ({ t, handleAcceptPolicy, handleDeclinePolicy }) => {
  return (
    <div className="flex justify-center items-center h-screen bg-white md:py-16">
      <div className="max-w-2xl w-full bg-white shadow-xl overflow-hidden transform transition-all h-full flex flex-col">
        {/* Header */}
        <div className="w-full p-6 md:p-8 border-b border-gray-300 bg-blue-500">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row gap-2">
              <Icon icon="mdi:shield-check" className="text-3xl text-white" />
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {t("login.POLICY_TITLE")}
              </h1>
            </div>
            <div className="md:ml-4">
              <LanguageSelector />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6 flex-grow overflow-y-auto">
          <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium">
            {t("login.POLICY_TEXT")} {t("login.POLICY_TEXT")}
            {t("login.POLICY_TEXT")} {t("login.POLICY_TEXT")}
          </p>

          {/* Enhanced Buttons Section */}
          <div className="flex flex-col md:flex-row-reverse justify-between gap-4 p-4">
            <Button
              type="primary"
              size="large"
              icon={<Icon icon="mdi:check-circle" className="text-xl" />}
              onClick={handleAcceptPolicy}
              className="w-full md:w-48 h-12 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 border-none shadow-md hover:shadow-lg transition-all duration-200 group"
            >
              <span className="text-base font-semibold group-hover:translate-x-0.5 transition-transform">
                {t("login.ACCEPT_POLICY")}
              </span>
            </Button>

            <Button
              size="large"
              icon={
                <Icon
                  icon="mdi:close-circle"
                  className="text-xl text-red-600"
                />
              }
              onClick={handleDeclinePolicy}
              className="w-full md:w-48 h-12 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <span className="text-base font-semibold text-red-600 group-hover:translate-x-0.5 transition-transform">
                {t("login.DECLINE_POLICY")}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policy;
