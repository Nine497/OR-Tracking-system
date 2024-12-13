import React, { useEffect, useState } from "react";
import { Table, Badge } from "antd";

function ScheduleTable() {
  const [events, setEvents] = useState([]);
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
    setEvents(surgeryEvents);
  }, []);

  const columns = [
    {
      title: "Case ID",
      dataIndex: "case_id",
      key: "case_id",
    },
    {
      title: "Surgery Date",
      dataIndex: "surgery_date",
      key: "surgery_date",
    },
    {
      title: "Start Time",
      dataIndex: "estimate_start_time",
      key: "estimate_start_time",
    },
    {
      title: "Duration (minutes)",
      dataIndex: "estimate_duration",
      key: "estimate_duration",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "completed" ? "success" : "warning"}
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
    },
    {
      title: "Room",
      dataIndex: "room_name",
      key: "room_name",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
  ];

  return (
    <div className="p-6 ">
      <Table
        dataSource={events}
        columns={columns}
        rowKey="case_id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}

export default ScheduleTable;
