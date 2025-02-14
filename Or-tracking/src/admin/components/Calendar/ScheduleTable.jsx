import React, { useEffect, useState } from "react";
import { Table, Badge, DatePicker } from "antd";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
import timezone from "dayjs/plugin/timezone";
dayjs.extend(timezone);

const { RangePicker } = DatePicker;

function ScheduleTable() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
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
        setFilteredEvents(eventData);
        console.log("eventData,", eventData);
      } catch (error) {
        console.error("Error fetching surgery events:", error);
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      const filtered = events.filter((event) => {
        const surgeryDate = dayjs(event.surgery_start_time).tz(
          "Asia/Bangkok",
          true
        );
        return surgeryDate.isBetween(dateRange[0], dateRange[1], "day", "[]");
      });
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [dateRange, events]);

  const columns = [
    {
      title: <span className="text-base font-bold">HN Code</span>,
      dataIndex: "hn_code",
      key: "hn_code",
      render: (hn_code) => (
        <span className="text-base font-normal">{hn_code}</span>
      ),
    },
    // {
    //   title: <span className="text-base font-bold">Patient</span>,
    //   dataIndex: "patients_fullname",
    //   key: "patients_fullname",
    //   render: (patients_fullname) => (
    //     <span className="text-base font-normal">{patients_fullname}</span>
    //   ),
    // },
    {
      title: <span className="text-base font-bold">Surgery Date</span>,
      dataIndex: "surgery_start_time",
      key: "surgery_start_time",
      render: (date) => (
        <span className="text-base font-normal">
          {dayjs(date).format("YYYY/MM/DD")}
        </span>
      ),
      sorter: (a, b) =>
        dayjs(a.surgery_start_time).isBefore(dayjs(b.surgery_start_time))
          ? -1
          : 1,
    },
    {
      title: <span className="text-base font-bold">Time</span>,
      dataIndex: ["surgery_start_time", "surgery_end_time"],
      key: "surgery_time",
      render: (text, record) => (
        <span className="text-base font-normal">
          {dayjs(record.surgery_start_time)
            .tz("Asia/Bangkok", true)
            .format("HH:mm")}{" "}
          -{" "}
          {dayjs(record.surgery_end_time)
            .tz("Asia/Bangkok", true)
            .format("HH:mm")}
        </span>
      ),
    },
    {
      title: <span className="text-base font-bold">Doctor</span>,
      dataIndex: "doctor_fullname",
      key: "doctor_fullname",
      render: (doctor_fullname) => (
        <span className="text-base font-normal">{doctor_fullname}</span>
      ),
    },
    {
      title: <span className="text-base font-bold">Room</span>,
      dataIndex: "room_name",
      key: "room_name",
      render: (room_name) => (
        <span className="text-base font-normal">{room_name}</span>
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

      <Table
        dataSource={filteredEvents}
        columns={columns}
        rowKey="surgery_case_id"
        pagination={{ pageSize: 9 }}
        loading={loading}
      />
    </div>
  );
}

export default ScheduleTable;
