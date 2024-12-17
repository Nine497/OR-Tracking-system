import React, { useEffect, useState } from "react";
import { Calendar, Skeleton } from "antd";
import { formatTime } from "../../lib/TimeFormat";
import "./CalendarSchedule.css";
function CalendarSchedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const surgeryEvents = [
    {
      case_id: "C001",
      surgery_date: "2024-12-06",
      estimate_start_time: "08:30:00",
      estimate_duration: 120,
      status: "scheduled",
      room_name: "Room 1",
      location: "Floor 1",
    },
    {
      case_id: "C002",
      surgery_date: "2024-12-06",
      estimate_start_time: "09:15:00",
      estimate_duration: 90,
      status: "scheduled",
      room_name: "Room 2",
      location: "Floor 2",
    },
    {
      case_id: "C003",
      surgery_date: "2024-12-04",
      estimate_start_time: "11:00:00",
      estimate_duration: 60,
      status: "completed",
      room_name: "Room 3",
      location: "Floor 3",
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setEvents(surgeryEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const dateCellRender = (value) => {
    if (loading) {
      return <Skeleton active paragraph={{ rows: 2 }} />;
    }

    const dateStr = value.format("YYYY-MM-DD");
    const filteredEvents = events.filter(
      (event) => event.surgery_date === dateStr
    );

    return (
      <ul className="event-list space-y-3 w-full">
        {filteredEvents.map((event, index) => (
          <li
            key={index}
            className="flex justify-between
  bg-gray-200
        rounded-xl py-2
        shadow-md flex-col"
          >
            <div className="flex-shrink-0 px-3">
              <span className="text-base font-bold text-emerald-800">
                {event.case_id}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3">
              <span className="text-sm font-semibold text-emerald-700">
                {event.room_name}
              </span>
              <span className="text-emerald-400">•</span>
              <span className="text-sm font-medium text-emerald-600">
                {formatTime(event.estimate_start_time)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="w-full h-full p-5">
      {loading ? (
        <Skeleton active />
      ) : (
        <Calendar cellRender={dateCellRender} fullscreen={true} />
      )}
    </div>
  );
}

export default CalendarSchedule;
