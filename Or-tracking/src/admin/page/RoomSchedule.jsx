import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Spin } from "antd";
import { axiosInstanceStaff } from "../api/axiosInstance";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";

const RoomSchedule = () => {
  const [roomSchedule, setRoomSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().startOf("day"));
  const localizer = momentLocalizer(moment);

  useEffect(() => {
    const fetchRoomSchedule = async () => {
      setLoading(true);
      try {
        const response = await axiosInstanceStaff.get("/or_room/");
        if (response.status === 200) {
          const rooms = response.data.data || [];
          setRoomSchedule(rooms);
          console.log("Rooms", response.data);
        }
      } catch (error) {
        console.error("Error fetching room schedule:", error);
        setRoomSchedule([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomSchedule();
  }, []);

  const formatEvents = () => {
    if (
      !roomSchedule ||
      roomSchedule.length === 0 ||
      !cases ||
      cases.length === 0
    )
      return [];

    return roomSchedule.flatMap((room) => {
      return cases
        .filter((c) => {
          const surgeryDate = moment(c.surgery_date);
          console.log(
            "Comparing surgeryDate:",
            surgeryDate.format("DD/MM/YYYY"),
            "with selectedDate:",
            selectedDate.format("DD/MM/YYYY")
          );
          return (
            c.case_operating_room_id === room.operating_room_id &&
            surgeryDate.isSame(selectedDate, "day")
          );
        })
        .map((c) => {
          const [hours, minutes] = c.estimate_start_time.split(":");
          const startTime = moment()
            .startOf("day")
            .hours(parseInt(hours))
            .minutes(parseInt(minutes))
            .toDate();
          const endTime = moment(startTime)
            .add(c.estimate_duration, "minutes")
            .toDate();

          console.log("startTime", startTime);

          return {
            id: c.patient_HN,
            title: `${c.patient_firstname} ${c.patient_lastname} (HN: ${c.patient_HN})`,
            start: startTime,
            end: endTime,
            resourceId: room.operating_room_id,
            status: c.status_name,
            doctor: `${c.doctor_firstname} ${c.doctor_lastname}`,
            surgeryType: c.surgery_type_name,
          };
        });
    });
  };

  const eventStyleGetter = (event) => {
    const statusColors = {
      "Before treatment": "#F59E0B",
      "Transferred to the operating room": "#3B82F6",
      "Undergoing the procedure": "#F97316",
      "Procedure completed": "#22C55E",
      "Patient returned to the recovery room": "#A855F7",
    };

    const style = {
      backgroundColor: statusColors[event.status] || "#3182ce",
      color: "white",
      border: "none",
      borderRadius: "4px",
    };
    return { style };
  };

  const handleNavigate = (date) => {
    setSelectedDate(moment(date).startOf("day"));
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Icon icon="mdi:calendar" className="text-blue-600 w-6 h-6" />
          <h2 className="text-3xl font-semibold text-gray-800">
            ตารางห้องผ่าตัด {selectedDate.format("DD/MM/YYYY")}
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[calc(76vh-theme(spacing.32))] w-full">
          <Spin size="large" />
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          events={formatEvents()}
          startAccessor="start"
          endAccessor="end"
          resources={roomSchedule.map((room) => ({
            id: room.operating_room_id,
            title: room.room_name,
          }))}
          views={["day"]}
          defaultView="day"
          date={selectedDate.toDate()}
          onNavigate={handleNavigate}
          step={60}
          timeslots={1}
          resourceIdAccessor="resourceId"
          eventPropGetter={eventStyleGetter}
          style={{ height: 600 }}
          formats={{
            timeGutterFormat: "HH:mm",
            eventTimeRangeFormat: ({ start, end }) => {
              return `${moment(start).format("HH:mm")} - ${moment(end).format(
                "HH:mm"
              )}`;
            },
          }}
        />
      )}
    </div>
  );
};

export default RoomSchedule;
