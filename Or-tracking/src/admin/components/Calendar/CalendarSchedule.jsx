import React, { useEffect, useState } from "react";
import { Calendar, Skeleton } from "antd";
import "./CalendarSchedule.css";
import dayjs from "dayjs";
import { Icon } from "@iconify/react";

function CalendarSchedule({ events }) {
  const dateCellRender = (value) => {
    const dateStr = dayjs(value).format("YYYY-MM-DD");
    const filteredEvents = Array.isArray(events)
      ? events.filter(
          (event) => dayjs(event.surgery_date).format("YYYY-MM-DD") === dateStr
        )
      : [];

    return (
      <div className="w-full">
        {filteredEvents.length > 0 && (
          <div className="text-sm font-medium text-gray-600 mb-2">
            {`${filteredEvents.length} เคส`}
          </div>
        )}
        <ul className="event-list space-y-3 w-full mb-2">
          {filteredEvents.map((event, index) => (
            <li
              key={index}
              className="group relative overflow-hidden bg-white rounded-xl p-1
                               shadow-sm border border-gray-200 hover:shadow-md 
                               transition-all duration-200 ease-in-out"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 mb-1" />
              <div className="pl-3">
                {/* HN Code */}
                <div className="flex items-center justify-start mb-1">
                  <span
                    className="text-sm font-medium text-blue-700 
                                       bg-blue-100 px-3 py-1 rounded-full"
                  >
                    {event.hn_code}
                  </span>
                </div>

                {/* Doctor */}
                <div className="flex justify-start items-center text-gray-700 gap-1">
                  <Icon icon="mdi:stethoscope" width="16" height="16" />{" "}
                  <span className="text-sm font-normal">
                    {event.doctor_fullname}
                  </span>
                </div>
              </div>

              <div
                className="absolute inset-0 bg-blue-100 opacity-0 
                                     group-hover:opacity-10 transition-opacity duration-200"
              />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="w-full h-full p-5 ">
      <div className="bg-white rounded-xl shadow-sm">
        <Calendar
          cellRender={dateCellRender}
          fullscreen={true}
          mode="month"
          className="calendar-hidden-header"
        />
      </div>
    </div>
  );
}

export default CalendarSchedule;
