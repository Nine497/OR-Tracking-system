import React, { useEffect, useState } from "react";
import { Calendar, Skeleton } from "antd";
import axiosInstance from "../../api/axiosInstance";
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
        {/* แสดงจำนวนเคสทั้งหมด */}
        {filteredEvents.length > 0 && (
          <div className="text-sm font-medium text-gray-600 mb-2">
            {`ทั้งหมด : ${filteredEvents.length} เคส`}
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
              {/* Decorative element */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 mb-1" />

              {/* Main content */}
              <div className="pl-3">
                {/* HN Code */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-sm font-semibold text-blue-700 
                                       bg-blue-100 px-3 py-1 rounded-full"
                  >
                    {event.hn_code}
                  </span>
                </div>

                {/* Room and Time info */}
                <div className="flex items-center gap-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {event.room_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon icon="tabler:clock" width="14" height="14" />
                    <span className="text-sm font-medium">
                      {dayjs(event.estimate_start_time, "HH:mm").format(
                        "HH:mm"
                      )}{" "}
                      น.
                    </span>
                  </div>
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
