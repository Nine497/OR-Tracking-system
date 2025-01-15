import React, { useEffect, useState } from "react";
import { CalendarOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import RoomCard from "../components/RoomSchedule/RoomCard";
import axiosInstance from "../api/axiosInstance";

function RoomSchedule() {
  const [roomSchedule, setRoomSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomSchedule = async () => {
      try {
        const response = await axiosInstance.get("/or_room/");
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
        <div className="flex items-center space-x-3">
          <CalendarOutlined className="text-2xl text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            ตารางห้องผ่าตัดวันนี้
          </h2>
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
