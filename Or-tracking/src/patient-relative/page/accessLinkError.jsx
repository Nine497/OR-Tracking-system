import React from "react";
import { Result, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const AccessLinkError = ({ errorMessage, t }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Result
        status="error"
        title={
          <div className="space-y-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 text-center leading-tight">
              {errorMessage}
            </h1>
            <div className="space-y-3">
              <p className="font-normal text-sm sm:text-base lg:text-lg text-gray-600 text-center">
                {t("errors.message")}
              </p>
            </div>
          </div>
        }
        extra={
          <div className="flex justify-center mt-8">
            <Button
              type="primary"
              onClick={() => window.location.reload()}
              icon={<ReloadOutlined className="text-lg" />}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base px-6 py-2 h-auto hover:opacity-90 transition-all duration-300"
            >
              Refresh Page
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default AccessLinkError;
