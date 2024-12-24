import React from "react";
import { Result, Button } from "antd";

const AccessLinkError = ({ errorMessage, t }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Result
        status="error"
        title={<span className="text-4xl font-medium">{errorMessage}</span>}
        subTitle={
          <span className="text-2xl text-gray-600 font-normal">
            Please contact staff for more information.
          </span>
        }
        extra={
          <Button
            type="primary"
            onClick={() => window.location.reload()}
            className="text-xl p-5"
          >
            Reload
          </Button>
        }
      />
    </div>
  );
};

export default AccessLinkError;
