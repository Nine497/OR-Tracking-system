import React, { useEffect, useState } from "react";
import { Tabs, Spin } from "antd";
import Schedule from "../components/Calendar/CalendarSchedule";
import RoomSchedule from "../components/Calendar/RoomSchedule";
import Table from "../components/Calendar/ScheduleTable";
import { axiosInstanceStaff } from "../api/axiosInstance";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await axiosInstanceStaff.get(
          "/surgery_case/getCaseCalendar/"
        );
        const eventData = response.data.data || [];
        setEvents(eventData);
        console.log("eventData,", eventData);
      } catch (error) {
        console.error("Error fetching surgery events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const items = [
    {
      key: "1",
      label: <span className="text-xl font-medium">ปฏิทิน</span>,
      children: <RoomSchedule />,
    },
    {
      key: "2",
      label: <span className="text-xl font-medium">ตาราง</span>,
      children: <Table events={events} />,
    },
  ];

  return (
    <div className="w-full px-4 bg-white rounded-lg min-h-[500px]">
      {loading ? (
        <div className="flex justify-center items-center min-h-[calc(106vh-theme(spacing.32))] w-full">
          <Spin size="large" />
        </div>
      ) : (
        <Tabs defaultActiveKey="1" items={items} className="mt-3" />
      )}
    </div>
  );
}
