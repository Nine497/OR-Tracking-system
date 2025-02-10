import React, { useEffect, useState } from "react";
import { CalendarOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import RoomCard from "../components/RoomSchedule/RoomCard";
import { axiosInstanceStaff } from "../api/axiosInstance";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");
function RoomSchedule() {
  const [roomSchedule, setRoomSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomSchedule = async () => {
      try {
        const response = await axiosInstanceStaff.get("/or_room/");
        if (response.status === 200) {
          console.log("or_room", response.data.data);
          setRoomSchedule(response.data.data || []);
        } else {
          throw new Error(
            `Failed to fetch operating rooms: ${response.statusText}`
          );
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

  return (
    <div className="w-full p-2 rounded-xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-baseline space-x-3 justify-between w-full">
          <h2 className="text-3xl font-semibold">ตารางห้องผ่าตัดวันนี้</h2>
          <p className="text-lg text-gray-500 font-medium">
            {dayjs().format("วันdddd D MMMM YYYY")}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Loading room schedule..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {roomSchedule && roomSchedule.length > 0 ? (
            roomSchedule.map((room, index) => (
              <RoomCard key={index} room={room} />
            ))
          ) : (
            <p>No room schedule available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default RoomSchedule;
