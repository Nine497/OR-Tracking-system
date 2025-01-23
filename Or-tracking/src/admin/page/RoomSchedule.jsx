import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Spin } from "antd";
import { axiosInstanceStaff } from "../api/axiosInstance";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "./BigCalendar.css";
moment.locale("th");

const RoomSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [or_rooms, setOr_rooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().startOf("day"));
  const [events, setEvents] = useState([]);
  const localizer = momentLocalizer(moment);

  const messages = {
    previous: "ย้อนกลับ",
    next: "ถัดไป",
    today: "วันนี้",
  };

  useEffect(() => {
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
          setCases(caseResponse.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setOr_rooms([]);
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              title: (
                <div className="h-full flex flex-col space-y-1">
                  <span>
                    {c.patient_firstname} {c.patient_lastname}
                  </span>
                  <span className="tracking-wider">{c.hn_code || "N/A"}</span>
                </div>
              ),
              start: startTime,
              end: endTime,
              resourceId: c.operating_room_id,
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

  return (
    <div className="w-full p-6 bg-white rounded-xl min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:calendar" className="text-blue-600 w-6 h-6" />
          <h2 className="text-3xl font-semibold text-gray-800">
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
          date={selectedDate.toDate()}
          onNavigate={handleNavigate}
          step={60}
          timeslots={1}
          resourceIdAccessor={events.resourceId}
          style={{ height: 700 }}
          formats={{
            timeGutterFormat: "HH:mm",
            eventTimeRangeFormat: ({ start, end }) => {
              return `${moment(start).format("HH:mm")} - ${moment(end).format(
                "HH:mm"
              )}`;
            },
          }}
          messages={messages}
          className="scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100"
        />
      )}
    </div>
  );
};

export default RoomSchedule;
