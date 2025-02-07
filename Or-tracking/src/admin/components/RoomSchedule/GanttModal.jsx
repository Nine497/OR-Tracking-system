import React, { useEffect, useState, useRef } from "react";
import { Modal, Card, Typography, Empty } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "tailwindcss/tailwind.css";
import "./GanttModal.css";

const { Title } = Typography;

const GanttModal = ({ cases, isOpen, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [columnWidth, setColumnWidth] = useState(80);
  const [totalHours, setTotalHours] = useState(0);
  const containerRef = useRef(null);

  // แยกการจัดการ tasks ออกมา
  useEffect(() => {
    if (!Array.isArray(cases) || cases.length === 0) return;

    const validCases = cases.filter(
      (c) => c.surgery_start_time && c.surgery_end_time
    );

    if (validCases.length === 0) return;

    let earliestStart = Math.min(
      ...validCases.map((c) => new Date(c.surgery_start_time).getTime())
    );
    let latestEnd = Math.max(
      ...validCases.map((c) => new Date(c.surgery_end_time).getTime())
    );

    earliestStart = dayjs(earliestStart).subtract(3, "hour").toDate();
    latestEnd = dayjs(latestEnd).add(3, "hour").toDate();
    const hours = Math.ceil((latestEnd - earliestStart) / (1000 * 60 * 60));
    setTotalHours(hours);

    const formattedCases = validCases.map((c, index) => {
      const start = new Date(c.surgery_start_time);
      const end = new Date(c.surgery_end_time);
      return {
        id: c.id ? c.id.toString() : (index + 1).toString(),
        name: `${c.patient_HN}`,
        start,
        end,
        progress: 100,
        type: "task",
        isDisabled: true,
        tooltip: null,
        styles: {
          backgroundColor: "#4CAF50",
          backgroundSelectedColor: "#388E3C",
        },
      };
    });

    setTasks(formattedCases);
  }, [cases]);

  // แยกการคำนวณ columnWidth ออกมา
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // ใช้ setTimeout เพื่อให้แน่ใจว่า Modal render เสร็จแล้ว
    const timer = setTimeout(() => {
      const calculateWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.clientWidth;
          if (width > 0) {
            const newColumnWidth = Math.max(60, (width - 163) / totalHours);
            setColumnWidth(newColumnWidth);
          }
        }
      };

      calculateWidth();
      // เพิ่ม event listener สำหรับ resize
      window.addEventListener("resize", calculateWidth);

      return () => {
        window.removeEventListener("resize", calculateWidth);
      };
    }, 100); // รอ 100ms ให้ Modal render เสร็จ

    return () => clearTimeout(timer);
  }, [isOpen, totalHours]);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width="100%"
      centered
      className="gantt-modal"
      closable={false}
      bodyStyle={{ padding: 0, maxHeight: "80vh", overflow: "auto" }}
      title={
        <div className="flex justify-between items-center w-full">
          <Title level={4} className="text-indigo-700 mb-0">
            ตารางเวลาห้องผ่าตัด
          </Title>
          <CloseOutlined
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 cursor-pointer text-lg"
          />
        </div>
      }
    >
      <div className="flex flex-col h-full bg-gray-50">
        <div className="flex-1 py-4 px-1 overflow-auto">
          <Card
            className="h-full w-full rounded-lg shadow-sm border border-gray-200"
            bodyStyle={{ padding: 0, height: "auto", width: "100%" }} // ปรับให้ความสูงของ Card ตามเนื้อหา
          >
            {tasks.length > 0 ? (
              <div
                ref={containerRef}
                className="h-full w-full overflow-auto custom-scrollbar"
              >
                <div className="flex-1">
                  <Gantt
                    tasks={tasks}
                    viewMode={ViewMode.Hour}
                    columnWidth={columnWidth}
                    listCellWidth="160px"
                    rowHeight={60}
                    barCornerRadius={4}
                    ganttHeight={0}
                    headerHeight={80}
                    fontSize="14px"
                    todayColor="rgba(99, 102, 241, 0.1)"
                    barFill={80}
                    preStepsCount={3}
                    locale="th"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <Empty
                  description="ไม่พบข้อมูลการผ่าตัด"
                  className="text-gray-500"
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </Modal>
  );
};

export default GanttModal;
