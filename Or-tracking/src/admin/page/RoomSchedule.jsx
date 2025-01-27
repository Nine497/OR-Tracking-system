import React, { useEffect, useState, memo } from "react";
import { Icon } from "@iconify/react";
import { Spin, Button, Card, Drawer } from "antd";
import { axiosInstanceStaff } from "../api/axiosInstance";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "./BigCalendar.css";
import "moment/locale/th";
import "dayjs/locale/th";
import dayjs from "dayjs";

const RoomSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [or_rooms, setOr_rooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().startOf("day"));
  const [events, setEvents] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const localizer = momentLocalizer(moment);
  const [refresh, setRefresh] = useState(false);

  const messages = {
    previous: "ย้อนกลับ",
    next: "ถัดไป",
    today: "วันนี้",
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomResponse, caseResponse] = await Promise.all([
        axiosInstanceStaff.get("/or_room/"),
        axiosInstanceStaff.get("/surgery_case/"),
      ]);

      if (roomResponse.status === 200) {
        setOr_rooms(roomResponse.data.data || []);
      }

      if (caseResponse.status === 200) {
        console.log("Case ", caseResponse.data.data);
        setCases(caseResponse.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setOr_rooms([]);
      setCases([]);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const handleOnRefresh = () => {
    setRefresh((prev) => !prev);
  };

  useEffect(() => {
    const generateEvents = () => {
      if (!or_rooms?.length || !cases?.length) return [];

      return or_rooms.flatMap((room) => {
        return cases
          .filter((c) => {
            const surgeryDate = moment(c.surgery_start_time);
            const isSameDay = surgeryDate.isSame(selectedDate, "day");
            return c.operating_room_id === room.operating_room_id && isSameDay;
          })
          .map((c) => {
            if (!c.surgery_start_time || !c.surgery_end_time) return null;

            const startTime = moment(c.surgery_start_time).toDate();
            const endTime = moment(c.surgery_end_time).toDate();

            return {
              id: c.hn_code,
              title: c.hn_code,
              start: startTime,
              end: endTime,
              resourceId: c.operating_room_id,
              caseData: c,
            };
          })
          .filter(Boolean);
      });
    };

    setEvents(generateEvents());
  }, [cases, or_rooms, selectedDate]);

  const handleNavigate = (date) => {
    setSelectedDate(moment(date).startOf("day"));
  };

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
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          resources={
            or_rooms?.map((room) => ({
              id: room.operating_room_id,
              title: room.room_name,
            })) || []
          }
          views={["day"]}
          defaultView="day"
          components={{
            timeGutterHeader: CustomTimeGutterHeader,
            toolbar: (toolbarProps) => {
              console.log("toolbarProps:", toolbarProps);
              return (
                <CustomToolbar
                  date={toolbarProps.date}
                  onNavigate={toolbarProps.onNavigate}
                  onRefresh={handleOnRefresh}
                />
              );
            },

            event: (props) => (
              <CustomEvent {...props} onClick={handleEventClick} />
            ),
          }}
          date={selectedDate.toDate()}
          onNavigate={handleNavigate}
          step={60}
          timeslots={1}
          resourceIdAccessor={events.resourceId}
          style={{ height: 700 }}
          messages={messages}
          className="scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100"
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

            <div className="bg-white  rounded-md p-4 space-y-2">
              <div className="flex justify-between border-b pb-2 border-gray-100">
                <span className="text-gray-600 text-base">
                  เวลาเริ่มการผ่าตัด
                </span>
                <span className="font-normal text-blue-800 text-lg">
                  {dayjs(new Date(selectedCase.surgery_start_time))
                    .locale("th")
                    .format("YYYY/MM/DD HH:mm")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-base">
                  เวลาสิ้นสุดการผ่าตัด
                </span>
                <span className="font-normal text-blue-800 text-lg">
                  {dayjs(new Date(selectedCase.surgery_end_time))
                    .locale("th")
                    .format("YYYY/MM/DD HH:mm")}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-md p-4">
              <span className="text-gray-500 text-base block mb-2">
                ประวัติผู้ป่วย
              </span>
              <p className="text-gray-800 text-lg">
                {selectedCase.patient_history || "ไม่มีข้อมูล"}
              </p>
            </div>

            <div className="bg-white rounded-md p-4">
              <span className="text-gray-500 text-base block mb-2">Note</span>
              <p className="text-gray-800 text-lg">
                {selectedCase.note || "ไม่มีข้อมูล"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center text-lg">ไม่มีข้อมูล</p>
        )}
      </Drawer>
    </div>
  );
};

const CustomToolbar = memo(({ date, onNavigate, onRefresh }) => {
  console.log("CustomToolbar rendered");

  const label = dayjs(new Date(date || new Date()))
    .locale("th")
    .format("DD MMMM YYYY");

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg ">
      <div className="flex flex-row gap-2 items-center">
        <button
          className="flex items-center gap-2 text-base text-black hover:not-focus bg-white border-black hover:bg-gray-300 hover:border-black"
          onClick={() => onNavigate("TODAY")}
        >
          วันนี้
        </button>

        <div className="flex gap-1">
          <button
            variant="outline"
            size="icon"
            className="h-full w-full bg-white hover:bg-gray-300 flex justify-center items-center rounded-full border-none p-2"
            onClick={() => onNavigate("PREV")}
          >
            <Icon icon="mdi:chevron-left" className="text-3xl" />
          </button>

          <button
            variant="outline"
            size="icon"
            className="h-full w-full bg-white hover:bg-gray-300 flex justify-center items-center rounded-full border-none p-2"
            onClick={() => onNavigate("NEXT")}
          >
            <Icon icon="mdi:chevron-right" className="text-3xl" />
          </button>
        </div>
        <span className="text-lg font-semibold text-gray-800">{label}</span>
      </div>

      <div className="flex items-center gap-3 h-full">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-gray-200 hover:bg-gray-100 h-full"
          onClick={onRefresh}
        >
          <Icon icon="mdi:refresh" className="text-xl" />
          <span className="font-medium text-base">อัปเดต</span>
        </Button>
      </div>
    </div>
  );
});

const CustomTimeGutterHeader = () => {
  return (
    <div className="font-medium text-center py-3">
      <span className="text-sm">Time</span>
    </div>
  );
};

const CustomEvent = ({ event, onClick }) => {
  return (
    <Card
      className="bg-blue-200 border-l-8 border-l-blue-600 border-t-0 border-r-0 border-b-0 h-full text-white cursor-pointer rounded-lg transition-colors duration-200"
      onClick={() => onClick(event)}
    >
      <div className="flex flex-col justify-between h-full text-blue-950">
        <p className="text-base md:text-lg lg:text-xl font-normal">
          {event.id}
        </p>

        <div className="flex-grow text-sm md:text-sm lg:text-base font-light">
          {moment(event.start).format("HH:mm")} -{" "}
          {moment(event.end).format("HH:mm")}
        </div>
      </div>
    </Card>
  );
};

export default RoomSchedule;
