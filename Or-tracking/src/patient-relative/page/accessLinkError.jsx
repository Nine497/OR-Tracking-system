import React from "react";
import { Result, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const AccessLinkError = ({ errorMessage }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white rounded-xl p-6 md:p-8">
        <Result
          status="error"
          title={
            <div className="space-y-4">
              <h1 className="text-2xl md:text-4xl font-semibold text-gray-800 text-center">
                {errorMessage}
              </h1>
              <p className="text-base md:text-lg text-gray-600 font-normal text-center">
                Please contact staff for more information.
              </p>
            </div>
          }
          extra={
            <div className="flex justify-center mt-6">
              <Button
                type="primary"
                onClick={() => window.location.reload()}
                icon={<ReloadOutlined />}
                className="flex items-center gap-2 text-base px-6 py-2 h-auto hover:opacity-90 transition-opacity"
              >
                Refresh Page
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default AccessLinkError;
