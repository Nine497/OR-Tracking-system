import React, { useEffect, useState } from "react";
import { Tabs, Spin } from "antd";
import Schedule from "../components/Calendar/CalendarSchedule";
import RoomSchedule from "../components/Calendar/RoomSchedule";
import Table from "../components/Calendar/ScheduleTable";
import { axiosInstanceStaff } from "../api/axiosInstance";

export default function Calendar() {
  const items = [
    {
      key: "1",
      label: <span className="text-xl font-medium">ปฏิทิน</span>,
      children: <RoomSchedule />,
    },
    {
      key: "2",
      label: <span className="text-xl font-medium">ตาราง</span>,
      children: <Table />,
    },
  ];

  return (
    <div className="w-full px-4 bg-white rounded-lg min-h-[500px]">
      <Tabs defaultActiveKey="1" items={items} className="mt-3" />
    </div>
  );
}
