import React, { useEffect, useState } from "react";
import { Card, Spin, Collapse } from "antd";
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../api/axiosInstance";
import dayjs from "dayjs";

function RoomCard({ room }) {
  const [cases, setCases] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { Panel } = Collapse;

  useEffect(() => {
    const fetchRoomDetails = async () => {
      setLoading(true);
      try {
        const casesResponse = await axiosInstance.get(
          `/surgery_case/getSurgery_case_ByOrID/${room.operating_room_id}`
        );

        const statusResponse = await axiosInstance.get("patient/getAllStatus");
        if (casesResponse.status === 200 && statusResponse.status === 200) {
          setCases(casesResponse.data);
          setStatuses(statusResponse.data);
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [room.operating_room_id]);

  const getStatusClass = (statusName) => {
    switch (statusName) {
      case "Before treatment":
        return "text-yellow-600";
      case "Transferred to the operating room":
        return "text-blue-600";
      case "Undergoing the procedure":
        return "text-orange-600";
      case "Procedure completed":
        return "text-green-600";
      case "Patient returned to the recovery room":
        return "text-purple-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="h-[340px] transform transition-all duration-300 hover:-translate-y-1">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-white">
              {room.room_name}
            </span>
            <span className="text-sm font-medium text-gray-50 bg-indigo-400 px-2 py-1 rounded-full">
              {cases.length} เคส
            </span>
          </div>
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
            height: "calc(100% - 56px)",
            overflow: "hidden",
          },
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : cases.length > 0 ? (
          <div className="h-[240px] bg-white rounded-lg">
            <Collapse
              accordion
              size="small"
              className="max-h-full overflow-y-auto divide-y divide-indigo-100 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent"
            >
              {cases
                .sort((a, b) =>
                  dayjs(a.estimate_start_time, "HH:mm:ss").diff(
                    dayjs(b.estimate_start_time, "HH:mm:ss")
                  )
                )
                .map((c, caseIndex) => (
                  <Panel
                    key={caseIndex}
                    header={
                      <div className="flex items-center justify-between w-full py-1">
                        {/* Patient HN */}
                        <span className="inline-flex items-center px-4 py-1.5 text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-full ring-1 ring-indigo-200">
                          {c.patient_HN}
                        </span>

                        {/* Time */}
                        <div className="flex items-center space-x-2 text-gray-600">
                          <ClockCircleOutlined className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-medium">
                            {dayjs(c.estimate_start_time, "HH:mm:ss").format(
                              "HH:mm"
                            )}
                          </span>
                        </div>
                      </div>
                    }
                    className="transition-all duration-200 ease-in-out hover:bg-indigo-50"
                  >
                    <div className="space-y-4 bg-white rounded-lg">
                      {/* Surgery Type */}
                      <div className="grid grid-cols-3 gap-x-4 items-start">
                        <span className="text-sm font-medium text-gray-500">
                          Type:
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 break-words font-medium">
                          {c.surgery_type_name}
                        </span>
                      </div>

                      {/* Operation Name */}
                      <div className="grid grid-cols-3 gap-x-4 items-start">
                        <span className="text-sm font-medium text-gray-500 ">
                          Operation:
                        </span>
                        <span className="col-span-2 text-sm text-gray-900 break-words font-medium">
                          Operation name
                        </span>
                      </div>

                      {/* Status */}
                      <div className="grid grid-cols-3 gap-x-4 items-start">
                        <span className="text-sm font-medium text-gray-500">
                          Status:
                        </span>
                        <span
                          className={`col-span-2 text-sm ${getStatusClass(
                            c.status_name
                          )} break-words font-medium`}
                        >
                          {c.status_name}
                        </span>
                      </div>
                    </div>
                  </Panel>
                ))}
            </Collapse>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ExclamationCircleOutlined className="text-2xl mb-2 text-indigo-400" />
            <p className="text-sm font-medium text-gray-600">
              ไม่มีเคสการผ่าตัด
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default RoomCard;
