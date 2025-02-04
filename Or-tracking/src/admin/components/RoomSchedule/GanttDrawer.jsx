import React, { useEffect, useState } from "react";
import { Drawer, Card, Typography, Empty, Select } from "antd";
import dayjs from "dayjs";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "tailwindcss/tailwind.css";
import "./GanttDrawer.css";
const { Title } = Typography;
const { Option } = Select;

const GanttDrawer = ({ cases, isOpen, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [scale, setScale] = useState(ViewMode.Hour);
  const columnWidth = 150;

  useEffect(() => {
    if (!Array.isArray(cases)) {
      console.error("Invalid cases data");
      return;
    }

    const formattedCases = cases
      .filter((c) => c.surgery_start_time && c.surgery_end_time)
      .map((c, index) => {
        const start = new Date(c.surgery_start_time);
        const end = new Date(c.surgery_end_time);
        if (isNaN(start) || isNaN(end)) {
          console.warn("Invalid date for case:", c);
          return null;
        }
        return {
          id: c.id ? c.id.toString() : (index + 1).toString(),
          name: `${c.patient_HN}`,
          start,
          end,
          progress: 100,
          type: "task",
          isDisabled: true,
          tooltip: `เวลาเริ่ม: ${dayjs(start).format(
            "HH:mm"
          )} - เวลาสิ้นสุด: ${dayjs(end).format("HH:mm")}`,
        };
      })
      .filter((task) => task !== null);

    setTasks(formattedCases);
  }, [cases]);

  // จัดการเปลี่ยน scale (view mode)
  const handleScaleChange = (value) => {
    switch (value) {
      case "hour":
        setScale(ViewMode.Hour);
        break;
      case "day":
        setScale(ViewMode.Day);
        break;
      case "week":
        setScale(ViewMode.Week);
        break;
      case "month":
        setScale(ViewMode.Month);
        break;
      default:
        setScale(ViewMode.Hour);
    }
  };

  return (
    <Drawer
      title={
        <Title level={4} className="text-indigo-700 mb-0">
          ตารางเวลาห้องผ่าตัด
        </Title>
      }
      placement="top"
      onClose={onClose}
      open={isOpen}
      width="100%"
      height="90%"
      bodyStyle={{ padding: 0 }}
      className="gantt-drawer"
    >
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header บน Drawer สำหรับควบคุม */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">มุมมอง:</span>
            <Select
              value={scale}
              onChange={handleScaleChange}
              className="w-40"
              size="middle"
            >
              <Option value="hour">รายชั่วโมง</Option>
              <Option value="day">รายวัน</Option>
              <Option value="week">รายสัปดาห์</Option>
              <Option value="month">รายเดือน</Option>
            </Select>
          </div>
        </div>

        {/* ส่วนแสดง Gantt Chart */}
        <div className="flex-1 p-4 overflow-auto">
          <Card
            className="h-full w-full rounded-lg shadow-sm border border-gray-200"
            bodyStyle={{ padding: 0, height: "100%", width: "100%" }}
          >
            {tasks.length > 0 ? (
              <div className="h-full w-full overflow-auto custom-scrollbar">
                <Gantt
                  tasks={tasks}
                  viewMode={scale}
                  columnWidth={columnWidth}
                  listCellWidth="280px"
                  rowHeight={50}
                  barCornerRadius={4}
                  ganttHeight={tasks.length * 50 + 40}
                  headerHeight={50}
                  fontSize="14px"
                  todayColor="rgba(99, 102, 241, 0.1)"
                  barFill={80}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <Empty
                  description="ไม่พบข้อมูลตารางการผ่าตัด"
                  className="text-gray-500"
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </Drawer>
  );
};

export default GanttDrawer;
