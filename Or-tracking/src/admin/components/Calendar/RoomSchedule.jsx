import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Spin, Drawer, Descriptions } from "antd";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthGrid,
  createViewMonthAgenda,
  createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { createCurrentTimePlugin } from "@schedule-x/current-time";
import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";
import "@schedule-x/theme-default/dist/index.css";
import moment from "moment-timezone";
import "./BigCalendar.css";
import { createScrollControllerPlugin } from "@schedule-x/scroll-controller";

const calendarControls = createCalendarControlsPlugin();

const RoomSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [orRooms, setOrRooms] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const eventsService = createEventsServicePlugin();
  const calendars = {
    OR1: {
      colorName: "OR1",
      lightColors: {
        main: "#AEEEEE", // ฟ้า
        container: "#AEEEEE",
        onContainer: "#00008b",
      },
      darkColors: {
        main: "#1C3D5B",
        container: "#3E6B8D",
        onContainer: "#00008b",
      },
    },
    OR2: {
      colorName: "OR2",
      lightColors: {
        main: "#fcd5f6", // เขียวสด
        container: "#fcd5f6",
        onContainer: "#00008b",
      },
      darkColors: {
        main: "#4CAF50",
        container: "#388E3C",
        onContainer: "#00008b",
      },
    },
    OR3: {
      colorName: "OR3",
      lightColors: {
        main: "#ffd500", // เหลืองทอง
        container: "#ffd500",
        onContainer: "#00008b",
      },
      darkColors: {
        main: "#FFB800",
        container: "#D37F00",
        onContainer: "#00008b",
      },
    },
    OR4: {
      colorName: "OR4",
      lightColors: {
        main: "#8A2BE2", // ม่วง
        container: "#D2C8FF",
        onContainer: "#00008b",
      },
      darkColors: {
        main: "#6A1E99",
        container: "#8B5FE6",
        onContainer: "#00008b",
      },
    },
    OR5: {
      colorName: "OR5",
      lightColors: {
        main: "#9dff00", // ฟ้าอมเขียว
        container: "#9dff00",
        onContainer: "#00008b",
      },
      darkColors: {
        main: "#008B8B",
        container: "#006F6F",
        onContainer: "#00008b",
      },
    },
    OR6: {
      colorName: "OR6",
      lightColors: {
        main: "#7FFF00",
        container: "#D3FFD3",
        onContainer: "#00008b",
      },
      darkColors: {
        main: "#4CAF50",
        container: "#388E3C",
        onContainer: "#00008b",
      },
    },
    OR7: {
      colorName: "OR7",
      lightColors: {
        main: "#00CED1",
        container: "#AEEEEE",
        onContainer: "#00008b",
      },
      darkColors: {
        main: "#008B8B",
        container: "#006F6F",
        onContainer: "#00008b",
      },
    },
    OR8: {
      colorName: "OR8",
      lightColors: {
        main: "#FF6347",
        container: "#F7D6D2",
        onContainer: "#00008b",
      },
      darkColors: {
        main: "#D9382C",
        container: "#9F4C42",
        onContainer: "#00008b",
      },
    },
    OR9: {
      colorName: "OR9",
      lightColors: {
        main: "#1E90FF",
        container: "#C9DFFF",
        onContainer: "#00008b",
      },
      darkColors: {
        main: "#1B6BB8",
        container: "#93AEDD",
        onContainer: "#00008b",
      },
    },
    OR10: {
      colorName: "OR10",
      lightColors: {
        main: "#8A2BE2",
        container: "#D2C8FF",
        onContainer: "#00008b",
      },
      darkColors: {
        main: "#6A1E99",
        container: "#8B5FE6",
        onContainer: "#00008b",
      },
    },
    // OR11: {
    //   colorName: "OR11",
    //   lightColors: {
    //     main: "#4B0082",
    //     container: "#D9C8FF",
    //     onContainer: "#2E0066",
    //   },
    //   darkColors: {
    //     main: "#370D61",
    //     container: "#6E4A8A",
    //     onContainer: "#1A0042",
    //   },
    // },
    // OR12: {
    //   colorName: "OR12",
    //   lightColors: {
    //     main: "#FF1493",
    //     container: "#F5A3F7",
    //     onContainer: "#C70071",
    //   },
    //   darkColors: {
    //     main: "#D80078",
    //     container: "#9A1F4B",
    //     onContainer: "#A5005C",
    //   },
    // },
    // OR13: {
    //   colorName: "OR13",
    //   lightColors: {
    //     main: "#F0E68C",
    //     container: "#F1F7D7",
    //     onContainer: "#A0A00A",
    //   },
    //   darkColors: {
    //     main: "#D3D240",
    //     container: "#6A6D2F",
    //     onContainer: "#6C6B1F",
    //   },
    // },
    // OR14: {
    //   colorName: "OR14",
    //   lightColors: {
    //     main: "#20B2AA",
    //     container: "#A7D8D1",
    //     onContainer: "#168A70",
    //   },
    //   darkColors: {
    //     main: "#168F7E",
    //     container: "#409B95",
    //     onContainer: "#0D5B3E",
    //   },
    // },
    // OR15: {
    //   colorName: "OR15",
    //   lightColors: {
    //     main: "#8A2BE2",
    //     container: "#D2C8FF",
    //     onContainer: "#5E2BC0",
    //   },
    //   darkColors: {
    //     main: "#6A1E99",
    //     container: "#8B5FE6",
    //     onContainer: "#4C1B80",
    //   },
    // },
    // OR16: {
    //   colorName: "OR16",
    //   lightColors: {
    //     main: "#A52A2A",
    //     container: "#F0D0D0",
    //     onContainer: "#6B0D0D",
    //   },
    //   darkColors: {
    //     main: "#8B1A1A",
    //     container: "#B47A7A",
    //     onContainer: "#420000",
    //   },
    // },
    // OR17: {
    //   colorName: "OR17",
    //   lightColors: {
    //     main: "#2F4F4F",
    //     container: "#A7B5B5",
    //     onContainer: "#1C3D3D",
    //   },
    //   darkColors: {
    //     main: "#1C3D3D",
    //     container: "#4C7070",
    //     onContainer: "#123434",
    //   },
    // },
    // OR18: {
    //   colorName: "OR18",
    //   lightColors: {
    //     main: "#FF4500",
    //     container: "#F1D3C6",
    //     onContainer: "#D84D00",
    //   },
    //   darkColors: {
    //     main: "#D63A00",
    //     container: "#9E6A4C",
    //     onContainer: "#B74100",
    //   },
    // },
    // OR19: {
    //   colorName: "OR19",
    //   lightColors: {
    //     main: "#B22222",
    //     container: "#F4B7B0",
    //     onContainer: "#8C1212",
    //   },
    //   darkColors: {
    //     main: "#9B1D1D",
    //     container: "#D0736E",
    //     onContainer: "#670000",
    //   },
    // },
    // OR20: {
    //   colorName: "OR20",
    //   lightColors: {
    //     main: "#32CD37",
    //     container: "#D0F0C0",
    //     onContainer: "#1A7A1A",
    //   },
    //   darkColors: {
    //     main: "#28A029",
    //     container: "#A2E0A2",
    //     onContainer: "#0D5E0D",
    //   },
    // },
  };

  const scrollController = createScrollControllerPlugin({
    initialScroll: "08:00",
  });
  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
      createViewWeek(),
    ],
    weekOptions: {
      timeAxisFormatOptions: {
        hour: "2-digit",
        minute: "2-digit",
      },
      eventOverlap: true,
    },
    defaultView: "week",
    locale: "th-TH",
    firstDayOfWeek: 1,
    isDark: false,
    calendars: calendars,
    isResponsive: true,
    plugins: [eventsService, calendarControls, scrollController],
    callbacks: {
      onClickDate: (date) => {
        handleDateClick(date);
      },
      onEventClick: (event) => {
        handleEventClick(event);
      },
    },
  });

  const handleDateClick = (date) => {
    if (calendarControls) {
      const currentView = calendarControls.getView();
      // console.log("Current View:", currentView);

      if (currentView === "month-grid") {
        calendarControls.setView("day");
        calendarControls.setDate(date);
      }
    }
  };

  createCurrentTimePlugin({
    fullWeekWidth: true,

    timeZoneOffset: 120,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomResponse, caseResponse] = await Promise.all([
        axiosInstanceStaff.get("/or_room/"),
        axiosInstanceStaff.get("/surgery_case/activeNow"),
      ]);

      if (roomResponse.status === 200) {
        setOrRooms(
          roomResponse.data.data.map((room) => ({
            id: room.operating_room_id,
            title: room.room_name,
          })) || []
        );
      }

      if (caseResponse.status === 200) {
        console.log("respond event data", caseResponse.data.data);

        const eventList = caseResponse.data.data
          .map((c) => {
            const startTime = moment(c.surgery_start_time);
            const endTime = moment(c.surgery_end_time);

            const validStartTime = startTime.isValid()
              ? startTime.format("YYYY-MM-DD HH:mm")
              : moment().format("YYYY-MM-DD HH:mm");
            const validEndTime = endTime.isValid()
              ? endTime.format("YYYY-MM-DD HH:mm")
              : moment(validStartTime)
                  .add(1, "hour")
                  .format("YYYY-MM-DD HH:mm");

            return {
              id: c.hn_code,
              title: `${c.patient_firstname} ${c.patient_lastname} (${c.room_name})`,
              start: validStartTime,
              end: validEndTime,
              location: c.note || "-",
              description: "c.note",
              // location: c.room_name,
              resourceId: c.operating_room_id,
              caseData: c,
              // calendarId: c.room_name.toString().trim(),
              calendarId: c.room_name,
            };
          })
          .filter((event) => event.start && event.end);

        if (eventsService) {
          console.log("eventList", eventList);

          eventsService.set(eventList);
        } else {
          console.error("eventsService is not initialized.");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setOrRooms([]);
      if (eventsService) {
        eventsService.set([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEventClick = (event) => {
    // console.log("event", event);

    setSelectedCase(event.caseData);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedCase(null);
  };

  const StatusBadge = ({ status }) => (
    <span className="px-3 py-1 rounded-full text-lg font-medium bg-green-100 text-green-800">
      {status}
    </span>
  );

  const InfoRow = ({ label, value, hasBorder = true }) => (
    <div
      className={`flex items-start py-3 ${
        hasBorder ? "border-b border-gray-100" : ""
      }`}
    >
      <span className="text-gray-600 text-base font-medium mr-2 whitespace-nowrap">
        {label}
      </span>
      <span
        className="font-medium text-gray-900 text-base flex-1 "
        title={value}
      >
        {value || "-"}
      </span>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-xl min-h-full">
      {loading ? (
        <div className="flex justify-center items-center min-h-[calc(76vh-theme(spacing.32))] w-full">
          <Spin size="large" />
        </div>
      ) : (
        <ScheduleXCalendar step={30} calendarApp={calendar} />
      )}

      <Drawer
        open={drawerVisible}
        onClose={handleCloseDrawer}
        width={600}
        className="custom-case-drawer"
        title={
          <div className="text-lg font-semibold text-gray-900">
            รายละเอียดการผ่าตัด
          </div>
        }
      >
        {selectedCase ? (
          <div className="space-y-6">
            {/* Header Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 transition-all hover:shadow-md">
                <span className="text-sm text-blue-600 block mb-1 font-medium">
                  HN
                </span>
                <p className="font-semibold text-blue-900 text-xl">
                  {selectedCase.hn_code}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 transition-all hover:shadow-md">
                <span className="text-sm text-green-600 block mb-1 font-medium">
                  สถานะ
                </span>
                <StatusBadge status={selectedCase.status_th} />
              </div>
            </div>

            {/* Main Information Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
              <InfoRow
                label="ชื่อผู้ป่วย"
                value={`${selectedCase.patient_firstname} ${selectedCase.patient_lastname}`}
              />
              <InfoRow
                label="แพทย์"
                value={`${selectedCase.doctor_prefix} ${selectedCase.doctor_firstname} ${selectedCase.doctor_lastname}`}
              />
              <InfoRow label="ห้องผ่าตัด" value={selectedCase.room_name} />
              <InfoRow
                label="วันผ่าตัด"
                value={moment(selectedCase.surgery_start_time).format(
                  "YYYY/MM/DD"
                )}
              />
              <InfoRow
                label="เวลาผ่าตัด"
                value={`${moment(selectedCase.surgery_start_time).format(
                  "HH:mm"
                )} - ${moment(selectedCase.surgery_end_time).format("HH:mm")}`}
              />
              <InfoRow
                label="ประเภทการผ่าตัด"
                value={selectedCase.surgery_type_name}
              />
              <InfoRow label="การผ่าตัด" value={selectedCase.operation_name} />
              <InfoRow
                label="Note"
                value={selectedCase.note}
                hasBorder={false}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-lg">ไม่มีข้อมูล</p>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RoomSchedule;
