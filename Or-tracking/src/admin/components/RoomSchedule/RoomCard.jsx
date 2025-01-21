import React, { useEffect, useState } from "react";
import { Card, Spin, Collapse } from "antd";
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import dayjs from "dayjs";
import "./RoomCard.css";

function RoomCard({ room }) {
  const [cases, setCases] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { Panel } = Collapse;

  useEffect(() => {
    const fetchRoomDetails = async () => {
      setLoading(true);
      try {
        const casesResponse = await axiosInstanceStaff.get(
          `/surgery_case/getSurgery_case_ByOrID/${room.operating_room_id}`
        );

        const statusResponse = await axiosInstanceStaff.get(
          "patient/getAllStatus"
        );
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
    <div
      className="max-h-[330px] min-h-[330px] w-full 
                    transform transition-all duration-300 hover:-translate-y-1"
    >
      <Card
        title={
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <span className="text-lg sm:text-xl font-semibold text-white">
              {room.room_name}
            </span>
            <span
              className="text-xs sm:text-sm font-medium text-gray-50 
                           bg-indigo-400/80 px-2.5 py-1 rounded-full"
            >
              {cases.length} เคส
            </span>
          </div>
        }
        className="h-full hover:shadow-xl transition-shadow duration-300 
                   bg-[#FBFBFB] border border-indigo-50"
        styles={{
          header: {
            background: "linear-gradient(135deg, #4A6CF7 0%, #3658E0 100%)",
            borderBottom: "1px solid rgba(230, 240, 255, 0.2)",
            borderRadius: "12px 12px 0 0",
            padding: "12px 16px",
            "@media (min-width: 640px)": {
              padding: "16px 20px",
            },
          },
          body: {
            padding: "12px",
            height: "calc(100% - 52px)",
            overflow: "hidden",
            "@media (min-width: 640px)": {
              padding: "16px",
              height: "calc(100% - 56px)",
            },
          },
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : cases.length > 0 ? (
          <div className="h-[calc(100%-16px)] bg-[#FBFBFB] border-none CollapseCustom">
            <Collapse
              accordion
              size="small"
              className="max-h-full overflow-y-auto custom-scrollbar 
                       px-2 sm:px-3 md:px-4 py-1 sm:py-2"
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
                      <div
                        className="flex flex-row xs:flex-row justify-between 
                                  items-start xs:items-center gap-2 xs:gap-0 
                                  w-full py-1.5 px-1"
                      >
                        <span
                          className="inline-flex items-center px-2.5 xs:px-3 py-1 
                                     text-xs sm:text-sm font-semibold 
                                     bg-gradient-to-r from-indigo-50 to-violet-50
                                     text-indigo-700 rounded-full 
                                     ring-1 ring-indigo-200/50 tracking-wider"
                        >
                          {c.patient_HN}
                        </span>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full bg-indigo-50 
                                      flex items-center justify-center"
                          >
                            <ClockCircleOutlined className="text-indigo-500 text-xs" />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">
                            {dayjs(c.estimate_start_time, "HH:mm:ss").format(
                              "HH:mm"
                            )}
                          </span>
                        </div>
                      </div>
                    }
                    className="bg-white hover:bg-gradient-to-r hover:from-indigo-50/30 
                            hover:to-violet-50/30 transition-all duration-300
                            shadow-sm hover:shadow rounded-lg mb-2"
                  >
                    <div className="space-y-2 sm:space-y-3 p-2 sm:p-3">
                      {["Type", "Operation", "Status"].map((field, index) => (
                        <div
                          key={field}
                          className="grid grid-cols-[80px,1fr] xs:grid-cols-[100px,1fr] 
                                                items-start gap-2 sm:gap-3"
                        >
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            {field}:
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-medium
                          ${
                            field === "Status"
                              ? getStatusClass(c.status_name)
                              : "text-gray-900"
                          }`}
                          >
                            {field === "Type"
                              ? c.surgery_type_name
                              : field === "Operation"
                              ? "Operation name"
                              : c.status_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Panel>
                ))}
            </Collapse>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <ExclamationCircleOutlined className="text-xl sm:text-2xl text-indigo-400" />
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              ไม่มีเคสการผ่าตัด
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default RoomCard;
