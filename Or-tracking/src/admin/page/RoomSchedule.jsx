import React, { useEffect, useState } from "react";
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
  const [drawerVisible, setDrawerVisible] = useState(false); // สถานะการแสดง Drawer
  const [selectedCase, setSelectedCase] = useState(null); // ข้อมูลเคสที่เลือก
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
    <div className="w-full p-6 bg-white rounded-xl shadow-sm min-h-full">
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
            toolbar: (toolbarProps) => (
              <CustomToolbar
                {...toolbarProps}
                onRefresh={handleOnRefresh}
                loading={loading}
              />
            ),
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

const CustomToolbar = ({ toolbar, onRefresh, loading }) => {
  console.log("toolbar", toolbar);

  const label = dayjs(new Date(toolbar?.date))
    .locale("th")
    .format("วันที่ DD MMMM YYYY");

  return (
    <div className="flex flex-row items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
      {/* ปุ่มนำทาง */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="primary"
          icon={<Icon icon="mdi:calendar-today" className="h-5" />}
          onClick={() => toolbar.onNavigate("TODAY")}
          className="flex items-center gap-1"
        >
          วันนี้
        </Button>

        <Button
          type="primary"
          icon={<Icon icon="mdi:chevron-left" className="h-5" />}
          onClick={() => toolbar.onNavigate("PREV")}
          className="flex items-center gap-1"
        >
          ย้อนกลับ
        </Button>
        <Button
          type="primary"
          onClick={() => toolbar.onNavigate("NEXT")}
          className="flex items-center gap-1"
        >
          ถัดไป
          <Icon icon="mdi:chevron-right" className="h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-gray-800">{label}</span>
        <Button
          type="default"
          icon={<Icon icon="mdi:refresh" className="h-5" />}
          onClick={onRefresh}
          className={`flex items-center gap-1 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
};

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
      size="small"
      className="bg-[#FA8072] border-none h-full text-white cursor-pointer"
      onClick={() => onClick(event)}
    >
      <div className="flex flex-col justify-between h-full">
        {/* Event ID */}
        <p className="text-base md:text-lg lg:text-xl font-light">{event.id}</p>

        {/* Event Time */}
        <div className="flex-grow text-sm md:text-sm lg:text-base">
          {moment(event.start).format("HH:mm")} -{" "}
          {moment(event.end).format("HH:mm")}
        </div>
      </div>
    </Card>
  );
};

export default RoomSchedule;
