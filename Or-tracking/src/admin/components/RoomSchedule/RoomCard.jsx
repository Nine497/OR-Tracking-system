import React, { useEffect, useState, useMemo } from "react";
import { Card, Spin, Collapse } from "antd";
import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import dayjs from "dayjs";
import "./RoomCard.css";
import GanttModal from "./GanttModal";
import { Icon } from "@iconify/react";

function RoomCard({ room }) {
  const [cases, setCases] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { Panel } = Collapse;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCases, setSelectedCases] = useState([]);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      setLoading(true);
      try {
        const casesResponse = await axiosInstanceStaff.get(
          `/surgery_case/getSurgeryCaseByOrID/${room.operating_room_id}`
        );
        const statusResponse = await axiosInstanceStaff.get(
          "patient/getAllStatus"
        );

        if (casesResponse.status === 200 && statusResponse.status === 200) {
          console.log(casesResponse.data);
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

  const filteredCases = useMemo(
    () =>
      cases.filter((c) => c.case_operating_room_id === room.operating_room_id),
    [cases, room.operating_room_id]
  );

  const handleCardClick = (e) => {
    const isCollapseClick = e.target.closest(".ant-collapse");
    if (!isCollapseClick) {
      setSelectedCases(
        filteredCases.length > 0
          ? filteredCases
          : [{ room_name: room.room_name }]
      );
      setIsOpen(true);
    }
  };

  return (
    <div className="max-h-[330px] min-h-[330px] w-full">
      <Card
        title={
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <span className="text-lg sm:text-xl font-semibold text-white">
              {room.room_name}
            </span>
            <div className="flex items-center gap-2">
              <div
                className="cursor-pointer inline-flex items-center gap-2 
                 bg-white hover:bg-slate-300
                 px-3 py-0.5 rounded-lg
                 transform transition-all duration-200 hover:shadow-md
                 group"
                onClick={handleCardClick}
              >
                <Icon
                  icon="mdi:chart-gantt"
                  className="text-indigo-500 text-xl"
                />
                <p className="text-indigo-500 tracking-wide text-base">
                  Grantt
                </p>
              </div>
              <span className="select-none text-xs sm:text-sm font-medium text-gray-50 bg-indigo-400/80 px-2.5 py-1 rounded-full">
                {filteredCases.length} เคส
              </span>
            </div>
          </div>
        }
        className="h-full hover:shadow-xl transition-shadow duration-300 bg-[#FBFBFB] border border-indigo-50"
        styles={{
          header: {
            background: "linear-gradient(135deg, #4A6CF7 0%, #3658E0 100%)",
            borderBottom: "1px solid rgba(230, 240, 255, 0.2)",
            borderRadius: "12px 12px 0 0",
            padding: "12px 16px",
            "@media (min-width: 640px)": { padding: "16px 20px" },
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
        ) : filteredCases.length > 0 ? (
          <div className="h-[calc(100%-16px)] bg-[#FBFBFB] border-none CollapseCustom">
            <Collapse
              onClick={(e) => {
                e.stopPropagation();
              }}
              accordion
              size="small"
              className="max-h-full overflow-y-auto custom-scrollbar sm:py-2 border-none bg-transparent"
            >
              {filteredCases
                .sort((a, b) =>
                  dayjs(a.surgery_start_time, "HH:mm").diff(
                    dayjs(b.surgery_start_time, "HH:mm")
                  )
                )
                .map((c, caseIndex) => (
                  <Panel
                    key={caseIndex}
                    header={
                      <div className="flex flex-col">
                        <div className="flex flex-row justify-between items-center gap-2 w-full py-1">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ring-1
    ${c.status_id === 0 ? "bg-gray-100 text-gray-600 ring-gray-300" : ""}
    ${c.status_id === 4 ? "bg-green-100 text-green-700 ring-green-300" : ""}
    ${
      c.status_id !== 0 && c.status_id !== 4
        ? "bg-yellow-100 text-yellow-700 ring-yellow-300"
        : ""
    }
  `}
                          >
                            {c.patient_firstname} {c.patient_lastname}
                          </span>

                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm
      ${c.status_id === 0 ? "bg-gray-200" : ""}
      ${c.status_id === 4 ? "bg-green-200" : ""}
      ${c.status_id !== 0 && c.status_id !== 4 ? "bg-yellow-200" : ""}
    `}
                            >
                              <ClockCircleOutlined
                                className={`text-sm
        ${c.status_id === 0 ? "text-gray-600" : ""}
        ${c.status_id === 4 ? "text-green-700" : ""}
        ${c.status_id !== 0 && c.status_id !== 4 ? "text-yellow-700" : ""}
      `}
                              />
                            </div>
                            <span className="text-sm text-gray-700 font-medium">
                              {dayjs(c.surgery_start_time)
                                .tz("Asia/Bangkok", true)
                                .format("HH:mm")}
                            </span>
                          </div>
                        </div>
                        <div className="my-2 p-2 rounded-md bg-blue-50">
                          <span className="text-sm font-normal text-gray-800">
                            Note :{" "}
                          </span>
                          <span className="text-sm text-gray-600">
                            {c.note ? (
                              c.note
                            ) : (
                              <span className="italic text-gray-400">
                                ไม่มีหมายเหตุ
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    }
                    className="bg-white hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-violet-50/30 transition-all duration-300 shadow-sm hover:shadow rounded-lg mb-2"
                  >
                    <div className="space-y-2 sm:space-y-3 p-2 sm:p-3">
                      {[
                        { key: "Type", label: "ประเภท" },
                        { key: "operation_name", label: "การผ่าตัด" },
                        { key: "Status", label: "สถานะ" },
                      ].map(({ key, label }) => (
                        <div
                          key={key}
                          className="grid grid-cols-[80px,1fr] xs:grid-cols-[100px,1fr] items-start gap-2 sm:gap-3"
                        >
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            {label}:
                          </span>
                          <span className="text-xs sm:text-sm font-medium">
                            {key === "Type"
                              ? c.surgery_type_name
                              : key === "operation_name"
                              ? c.operation_name
                              : key === "Status"
                              ? c.status_th
                              : ""}
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
      <GanttModal
        cases={selectedCases}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        footer={null}
        centered
      />
    </div>
  );
}

export default RoomCard;
