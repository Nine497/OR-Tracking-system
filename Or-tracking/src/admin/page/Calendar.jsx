import React, { useEffect, useState } from "react";
import { Tabs, Spin } from "antd";
import Schedule from "../components/Calendar/CalendarSchedule";
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
      label: <span className="text-xl font-medium">Calendar</span>,
      children: <Schedule events={events} />,
    },
    {
      key: "2",
      label: <span className="text-xl font-medium">Table</span>,
      children: <Table events={events} />,
    },
  ];

  return (
    <div className="w-full px-4 bg-white rounded-lg min-h-[500px]">
      <span className="text-3xl font-semibold">ปฏิทินเคสผ่าตัด</span>
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : (
        <Tabs defaultActiveKey="1" items={items} className="mt-3" />
      )}
    </div>
  );
}
