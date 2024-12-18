import React from "react";
import { Result, Button } from "antd";
import { HomeOutlined, RollbackOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function ErrorPage() {
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Result
        status="404"
        title={
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            404 - Page Not Found
          </h1>
        }
        subTitle={
          <p className="text-xl text-gray-600 mb-6 font-normal">
            Oops! The page you're looking for seems to have wandered off into
            the digital wilderness.
          </p>
        }
        extra={
          <div className="flex justify-center space-x-4">
            <Button
              type="default"
              icon={<RollbackOutlined />}
              onClick={() => window.history.back()}
              className="flex items-center justify-center px-6 py-3 text-base"
            >
              Go Back
            </Button>
          </div>
        }
        className="flex flex-col items-center justify-center p-8"
      />
    </div>
  );
}

export default ErrorPage;
