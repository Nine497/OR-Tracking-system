import React, { useEffect, useState, useMemo } from "react";
import {
  Drawer,
  Card,
  Typography,
  Empty,
  Select,
  Radio,
  DatePicker,
} from "antd";
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

const generateTimeSlots = (startDate, endDate, view) => {
  const slots = [];
  let current = dayjs(startDate);
  const end = dayjs(endDate);

  while (current.isBefore(end) || current.isSame(end, view)) {
    slots.push(current);
    switch (view) {
      case "day":
        current = current.add(1, "day");
        break;
      case "month":
        current = current.add(1, "month");
        break;
      case "year":
        current = current.add(1, "year");
        break;
    }
  }
  return slots;
};

const GanttChart = ({ tasks }) => {
  const [view, setView] = useState("month");
  const [startDate, setStartDate] = useState(() => {
    return dayjs.min(tasks.map((task) => dayjs(task.start)));
  });
  const [endDate, setEndDate] = useState(() => {
    return dayjs.max(tasks.map((task) => dayjs(task.end)));
  });

  // Generate time slots based on view
  const timeSlots = useMemo(() => {
    return generateTimeSlots(startDate, endDate, view);
  }, [startDate, endDate, view]);

  // Calculate task positions
  const getTaskStyle = (task) => {
    const taskStart = dayjs(task.start);
    const taskEnd = dayjs(task.end);

    const totalDays = endDate.diff(startDate, "day");
    const taskStartDays = dayjs(task.start).diff(startDate, "day");
    const taskDuration = taskEnd.diff(taskStart, "day");

    const left = (taskStartDays / totalDays) * 100;
    const width = (taskDuration / totalDays) * 100;

    return {
      left: `${left}%`,
      width: `${width}%`,
    };
  };

  const formatTimeSlot = (date) => {
    switch (view) {
      case "day":
        return date.format("DD MMM");
      case "month":
        return date.format("MMM YYYY");
      case "year":
        return date.format("YYYY");
      default:
        return date.format("DD MMM YYYY");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Radio.Group
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="mb-4"
        >
          <Radio.Button value="day">Daily</Radio.Button>
          <Radio.Button value="month">Monthly</Radio.Button>
          <Radio.Button value="year">Yearly</Radio.Button>
        </Radio.Group>

        <div className="flex gap-4">
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            placeholder="Start Date"
          />
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            placeholder="End Date"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="flex border-b border-gray-200">
            <div className="w-48 flex-shrink-0 p-2 font-bold">Task Name</div>
            <div className="flex-grow flex">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="flex-1 p-2 text-center text-sm border-l border-gray-200"
                >
                  {formatTimeSlot(slot)}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          {tasks.map((task, index) => (
            <div key={index} className="flex relative group hover:bg-gray-50">
              <div className="w-48 flex-shrink-0 p-2 border-b border-gray-200">
                {task.name}
              </div>
              <div className="flex-grow relative h-12 border-b border-gray-200">
                <div
                  className="absolute top-1 h-10 bg-blue-500 rounded-md opacity-80 group-hover:opacity-100 transition-opacity"
                  style={getTaskStyle(task)}
                >
                  <div className="h-full flex items-center justify-center text-white text-xs px-2 truncate">
                    {task.name}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GanttDrawer;
