import { notification } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleFilled,
} from "@ant-design/icons";

const CustomNotification = {
  success: (message, description = "") => {
    notification.success({
      message: (
        <div className="flex items-center gap-2 font-medium text-emerald-700">
          {message}
        </div>
      ),
      description: description && (
        <div className="text-gray-600">{description}</div>
      ),
      className: "custom-notification",
      style: {
        backgroundColor: "white",
        border: "1px solid #E5E7EB",
        borderLeft: "4px solid #10B981",
        borderRadius: "8px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      duration: 4,
    });
  },

  error: (message, description = "") => {
    notification.error({
      message: (
        <div className="flex items-center gap-2 font-medium text-red-700">
          {message}
        </div>
      ),
      description: description && (
        <div className="text-gray-600">{description}</div>
      ),
      className: "custom-notification",
      style: {
        backgroundColor: "white",
        border: "1px solid #E5E7EB",
        borderLeft: "4px solid #EF4444",
        borderRadius: "8px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      duration: 4,
    });
  },

  warning: (message, description = "") => {
    notification.warning({
      message: (
        <div className="flex items-center gap-2 font-medium text-yellow-700">
          <InfoCircleFilled className="text-lg text-yellow-500" />
          {message}
        </div>
      ),
      description: description && (
        <div className="ml-6 text-gray-600">{description}</div>
      ),
      className: "custom-notification",
      style: {
        backgroundColor: "white",
        border: "1px solid #E5E7EB",
        borderLeft: "4px solid #F59E0B",
        borderRadius: "8px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      duration: 4,
    });
  },
};

export default CustomNotification;
