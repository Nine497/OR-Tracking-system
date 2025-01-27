import React, { useEffect, useState } from "react";
import { Table, Badge, DatePicker } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

function ScheduleTable({ events }) {
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const filtered = events.filter((event) => {
        const surgeryDate = dayjs(event.surgery_start_time);
        return surgeryDate.isBetween(dateRange[0], dateRange[1], "day", "[]");
      });
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [dateRange, events]);

  useEffect(() => {
    console.log("events", events);
  }, [filteredEvents]);

  const columns = [
    {
      title: "HN Code",
      dataIndex: "hn_code",
      key: "hn_code",
      render: (hn_code) => <span className="font-normal">{hn_code}</span>,
    },
    {
      title: "Surgery Date",
      dataIndex: "surgery_start_time",
      key: "surgery_start_time",
      render: (date) => (
        <span className="font-normal">{dayjs(date).format("YYYY/MM/DD")}</span>
      ),
      sorter: (a, b) =>
        dayjs(a.surgery_start_time).isBefore(dayjs(b.surgery_start_time))
          ? -1
          : 1,
    },
    {
      title: "Time",
      dataIndex: ["surgery_start_time", "surgery_end_time"],
      key: "surgery_time",
      render: (text, record) => (
        <span className="font-normal">
          {dayjs(record.surgery_start_time).format("HH:mm")} -{" "}
          {dayjs(record.surgery_end_time).format("HH:mm")}
        </span>
      ),
    },

    {
      title: "Doctor",
      dataIndex: "doctor_fullname",
      key: "doctor_fullname",
      render: (doctor_fullname) => (
        <span className="font-normal">{doctor_fullname}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status_id",
      key: "status_id",
      render: (status) => (
        <Badge
          color={status === 5 ? "green" : "red"}
          text={status === 5 ? "Completed" : "Pending"}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div style={{ marginBottom: 16 }}>
        <RangePicker
          value={
            dateRange[0] ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null
          }
          onChange={(dates) =>
            setDateRange(
              dates ? [dates[0].toISOString(), dates[1].toISOString()] : []
            )
          }
          format="YYYY/MM/DD"
          style={{ width: "100%" }}
        />
      </div>

      {/* Table */}
      <Table
        dataSource={filteredEvents}
        columns={columns}
        rowKey="surgery_case_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default ScheduleTable;
