import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Spin, Drawer } from "antd";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthGrid,
  createViewMonthAgenda,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { createCurrentTimePlugin } from "@schedule-x/current-time";
import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";
import "@schedule-x/theme-default/dist/index.css";
import moment from "moment-timezone";
import "./BigCalendar.css";
const calendarControls = createCalendarControlsPlugin();

const RoomSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [orRooms, setOrRooms] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const eventsService = createEventsServicePlugin();

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewMonthGrid(), createViewMonthAgenda()],
    defaultView: "month-grid",
    locale: "th-TH",
    firstDayOfWeek: 1,
    isDark: false,

    isResponsive: true,
    plugins: [eventsService, calendarControls],
    callbacks: {
      onClickDate: (date) => {
        handleDateClick(date);
      },
      onEventClick: (event) => {
        handleEventClick(event);
      },
    },
  });

  const handleDateClick = (date) => {
    if (calendarControls) {
      const currentView = calendarControls.getView();
      console.log("Current View:", currentView);

      if (currentView === "month-grid") {
        calendarControls.setView("day");
        calendarControls.setDate(date);
      }
    }
  };

  createCurrentTimePlugin({
    fullWeekWidth: true,

    timeZoneOffset: 120,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomResponse, caseResponse] = await Promise.all([
        axiosInstanceStaff.get("/or_room/"),
        axiosInstanceStaff.get("/surgery_case/"),
      ]);

      if (roomResponse.status === 200) {
        setOrRooms(
          roomResponse.data.data.map((room) => ({
            id: room.operating_room_id,
            title: room.room_name,
          })) || []
        );
      }

      if (caseResponse.status === 200) {
        const eventList = caseResponse.data.data
          .map((c) => {
            const startTime = moment(c.surgery_start_time);
            const endTime = moment(c.surgery_end_time);

            const validStartTime = startTime.isValid()
              ? startTime.format("YYYY-MM-DD HH:mm")
              : moment().format("YYYY-MM-DD HH:mm");
            const validEndTime = endTime.isValid()
              ? endTime.format("YYYY-MM-DD HH:mm")
              : moment(validStartTime)
                  .add(1, "hour")
                  .format("YYYY-MM-DD HH:mm");

            return {
              id: c.hn_code,
              title: c.hn_code,
              start: validStartTime,
              end: validEndTime,
              location: c.room_name,
              resourceId: c.operating_room_id,
              caseData: c,
              style: {
                background: "linear-gradient(45deg, #f91c45, #1c7df9)",
                opacity: 0.5,
              },
            };
          })
          .filter((event) => event.start && event.end);

        if (eventsService) {
          eventsService.set(eventList);
        } else {
          console.error("eventsService is not initialized.");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setOrRooms([]);
      if (eventsService) {
        eventsService.set([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEventClick = (event) => {
    console.log("event", event);

    setSelectedCase(event.caseData);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedCase(null);
  };

  const StatusBadge = ({ status }) => (
    <span className="px-3 py-1 rounded-full text-lg font-medium bg-green-100 text-green-800">
      {status}
    </span>
  );

  const InfoRow = ({ label, value, hasBorder = true }) => (
    <div
      className={`flex items-center justify-between py-3 ${
        hasBorder ? "border-b border-gray-100" : ""
      }`}
    >
      <span className="text-gray-600 text-base font-medium">{label}</span>
      <span className="font-medium text-gray-900 text-base">
        {value || "-"}
      </span>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-xl min-h-full">
      {loading ? (
        <div className="flex justify-center items-center min-h-[calc(76vh-theme(spacing.32))] w-full">
          <Spin size="large" />
        </div>
      ) : (
        <ScheduleXCalendar calendarApp={calendar} />
      )}

      <Drawer
        open={drawerVisible}
        onClose={handleCloseDrawer}
        width={600}
        className="custom-case-drawer"
        title={
          <div className="text-lg font-semibold text-gray-900">
            รายละเอียดการผ่าตัด
          </div>
        }
      >
        {selectedCase ? (
          <div className="space-y-6">
            {/* Header Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 transition-all hover:shadow-md">
                <span className="text-sm text-blue-600 block mb-1 font-medium">
                  HN
                </span>
                <p className="font-semibold text-blue-900 text-xl">
                  {selectedCase.hn_code}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 transition-all hover:shadow-md">
                <span className="text-sm text-green-600 block mb-1 font-medium">
                  สถานะ
                </span>
                <StatusBadge status={selectedCase.status_th} />
              </div>
            </div>

            {/* Main Information Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
              <InfoRow
                label="ชื่อผู้ป่วย"
                value={`${selectedCase.patient_firstname} ${selectedCase.patient_lastname}`}
              />
              <InfoRow
                label="แพทย์"
                value={`${selectedCase.doctor_prefix} ${selectedCase.doctor_firstname} ${selectedCase.doctor_lastname}`}
              />
              <InfoRow label="ห้องผ่าตัด" value={selectedCase.room_name} />
              <InfoRow
                label="วันผ่าตัด"
                value={moment(selectedCase.surgery_start_time).format(
                  "YYYY/MM/DD"
                )}
              />
              <InfoRow
                label="เวลาผ่าตัด"
                value={`${moment(selectedCase.surgery_start_time).format(
                  "HH:mm"
                )} - ${moment(selectedCase.surgery_end_time).format("HH:mm")}`}
              />
              <InfoRow
                label="ประเภทการผ่าตัด"
                value={selectedCase.surgery_type_name}
              />
              <InfoRow label="การผ่าตัด" value={selectedCase.operation_name} />
              <InfoRow
                label="Note"
                value={selectedCase.note}
                hasBorder={false}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-lg">ไม่มีข้อมูล</p>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RoomSchedule;
