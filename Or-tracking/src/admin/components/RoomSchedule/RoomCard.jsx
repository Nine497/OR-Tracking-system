import React from "react";
import { Card } from "antd";
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { formatTime } from "../../lib/TimeFormat";

function RoomCard({ room }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "Before treatment":
        return "text-yellow-600";
      case "Transferred to the operating room":
        return "text-blue-600";
      case "Undergoing the procedure":
        return "text-orange-600";
      case "Procedure completed":
        return "text-green-600";
      case "Patient returned to the recovery room":
        return "text-gray-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="transform transition-all duration-300 hover:-translate-y-1">
      <Card
        title={
          <span className="text-xl font-semibold text-white">
            {room.room_name}
          </span>
        }
        className="h-full hover:shadow-xl transition-shadow duration-300 bg-white border border-indigo-50"
        styles={{
          header: {
            background: "linear-gradient(135deg, #4A6CF7 0%, #3658E0 100%)",
            borderBottom: "1px solid rgba(230, 240, 255, 0.2)",
            borderRadius: "12px 12px 0 0",
            fontWeight: "600",
            color: "#FFFFFF",
          },
          body: {
            padding: "16px",
          },
        }}
      >
        {room.cases.length > 0 ? (
          <ul className="space-y-3">
            {room.cases.map((c, caseIndex) => (
              <li
                key={caseIndex}
                className="flex flex-col p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-indigo-200 text-indigo-800 rounded-full group-hover:bg-indigo-300 transition-colors">
                    {c.case_id}
                  </span>
                  <div className="flex items-center space-x-2">
                    <ClockCircleOutlined className="text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                    <span className="text-indigo-900 font-medium group-hover:text-indigo-950 transition-colors">
                      {formatTime(c.time)}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-700">
                    Des: {c.procedureType}
                  </span>
                </div>
                <div className="mt-1">
                  <span
                    className={`text-sm font-medium ${getStatusClass(
                      c.status
                    )}`}
                  >
                    Status: {c.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-500">
            <ExclamationCircleOutlined className="text-2xl mb-2 text-indigo-400" />
            <p className="text-sm font-medium text-gray-600">
              No cases scheduled
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default RoomCard;
