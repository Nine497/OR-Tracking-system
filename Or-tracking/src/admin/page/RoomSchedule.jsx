import React from "react";
import { CalendarOutlined } from "@ant-design/icons";
import RoomCard from "../components/RoomSchedule/RoomCard";

function RoomSchedule() {
  const roomSchedule = [
    {
      room_name: "Room 1",
      cases: [
        {
          case_id: "C001",
          time: "09:00",
          status: "Before treatment",
          procedureType: "Appendectomy",
        },
        {
          case_id: "C002",
          time: "11:00",
          status: "Undergoing the procedure",
          procedureType: "Cholecystectomy",
        },
      ],
    },
    {
      room_name: "Room 2",
      cases: [
        {
          case_id: "C003",
          time: "10:30",
          status: "Transferred to the operating room",
          procedureType: "Hernia Repair",
        },
      ],
    },
    { room_name: "Room 3", cases: [] },
    {
      room_name: "Room 4",
      cases: [
        {
          case_id: "C004",
          time: "08:00",
          status: "Procedure completed",
          procedureType: "Knee Replacement",
        },
        {
          case_id: "C005",
          time: "13:00",
          status: "Patient returned to the recovery room",
          procedureType: "Hip Replacement",
        },
      ],
    },
    { room_name: "Room 5", cases: [] },
    {
      room_name: "Room 6",
      cases: [
        {
          case_id: "C006",
          time: "14:00",
          status: "Before treatment",
          procedureType: "Cataract Surgery",
        },
      ],
    },
    { room_name: "Room 7", cases: [] },
    {
      room_name: "Room 8",
      cases: [
        {
          case_id: "C007",
          time: "07:00",
          status: "Undergoing the procedure",
          procedureType: "Coronary Bypass",
        },
        {
          case_id: "C008",
          time: "16:00",
          status: "Procedure completed",
          procedureType: "Liver Transplant",
        },
      ],
    },
  ];

  return (
    <div className="w-full p-8 bg-gradient-to-b from-gray-50 to-white rounded-xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <CalendarOutlined className="text-2xl text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Today's Operating Room Schedule
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {roomSchedule.map((room, index) => (
          <RoomCard key={index} room={room} />
        ))}
      </div>
    </div>
  );
}

export default RoomSchedule;
