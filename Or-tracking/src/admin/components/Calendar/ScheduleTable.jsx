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
        const surgeryDate = dayjs(event.surgery_date);
        return surgeryDate.isBetween(dateRange[0], dateRange[1], "day", "[]");
      });
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [dateRange, events]);

  const columns = [
    {
      title: "HN Code",
      dataIndex: "hn_code",
      key: "hn_code",
      render: (hn_code) => <span className="font-normal">{hn_code}</span>,
    },
    {
      title: "Surgery Date",
      dataIndex: "surgery_date",
      key: "surgery_date",
      render: (date) => (
        <span className="font-normal">{dayjs(date).format("DD/MM/YYYY")}</span>
      ),
      sorter: (a, b) =>
        dayjs(a.surgery_date).isBefore(dayjs(b.surgery_date)) ? -1 : 1,
    },
    {
      title: "Estimated Start Time",
      dataIndex: "estimate_start_time",
      key: "estimate_start_time",
      render: (time) => (
        <span className="font-normal">
          {dayjs(time, "HH:mm").format("HH:mm")} น.
        </span>
      ),
    },
    {
      title: "Room",
      dataIndex: "room_name",
      key: "room_name",
      render: (room) => <span className="font-normal">{room}</span>,
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
