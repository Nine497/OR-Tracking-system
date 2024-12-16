import React from "react";
import { Result, Button } from "antd";

function ErrorPage() {
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    </div>
  );
}

export default ErrorPage;
