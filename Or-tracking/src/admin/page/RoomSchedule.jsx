import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Spin, Drawer } from "antd";
import { axiosInstanceStaff } from "../api/axiosInstance";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createViewDay, createViewWeek } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { createCurrentTimePlugin } from "@schedule-x/current-time";
import "@schedule-x/theme-default/dist/index.css";
import moment from "moment";
import "./BigCalendar.css";

const RoomSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [orRooms, setOrRooms] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const eventsService = createEventsServicePlugin();

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek()],
    selectedDate: moment().format("YYYY-MM-DD"),
    events: eventsService.events,
    plugins: [
      eventsService,
      createCurrentTimePlugin({
        fullWeekWidth: true,
        timeZoneOffset: 120,
      }),
    ],
    resources: orRooms,
  });

  createCurrentTimePlugin({
    // Whether the indicator should be displayed in the full width of the week. Defaults to false
    fullWeekWidth: true,

    // Time zone offset in minutes. Can be any offset valid according to UTC (-720 to 840)
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
            // Validate start and end times
            const startTime = moment(c.surgery_start_time);
            const endTime = moment(c.surgery_end_time);

            // Fallback to current time if invalid
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
              resourceId: c.operating_room_id,
              caseData: c,
            };
          })
          .filter((event) => event.start && event.end); // Filter out invalid events

        // Set events in eventsService
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
    setSelectedCase(event.caseData);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedCase(null);
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:calendar" className="text-blue-600 w-6 h-6" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            ตารางห้องผ่าตัด
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[calc(76vh-theme(spacing.32))] w-full">
          <Spin size="large" />
        </div>
      ) : (
        <ScheduleXCalendar
          calendarApp={calendar}
          onEventClick={handleEventClick}
        />
      )}

      <Drawer
        open={drawerVisible}
        onClose={handleCloseDrawer}
        width={600}
        className="custom-case-drawer"
      >
        {selectedCase ? (
          <div className="space-y-4 p-4 rounded-lg text-lg font-normal">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-md p-3">
                <span className="text-base text-gray-500 block mb-1">HN</span>
                <p className="font-medium text-blue-800 text-xl tracking-wider">
                  {selectedCase.hn_code}
                </p>
              </div>
              <div className="bg-white rounded-md p-3">
                <span className="text-base text-gray-500 block mb-1">
                  สถานะ
                </span>
                <p className="font-medium text-green-700 text-xl">
                  {selectedCase.status_name}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-md p-4 space-y-2">
              <div className="flex justify-between border-b pb-2 border-gray-100">
                <span className="text-gray-600 text-base">ชื่อผู้ป่วย</span>
                <span className="font-normal text-gray-700 text-lg">
                  {selectedCase.patient_firstname}{" "}
                  {selectedCase.patient_lastname}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-100">
                <span className="text-gray-600 text-base">แพทย์</span>
                <span className="font-normal text-gray-900 text-lg">
                  {selectedCase.doctor_prefix} {selectedCase.doctor_firstname}{" "}
                  {selectedCase.doctor_lastname}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-100">
                <span className="text-gray-600 text-base">ห้องผ่าตัด</span>
                <span className="font-normal text-gray-900 text-lg">
                  {selectedCase.room_name}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center text-lg">ไม่มีข้อมูล</p>
        )}
      </Drawer>
    </div>
  );
};

export default RoomSchedule;
