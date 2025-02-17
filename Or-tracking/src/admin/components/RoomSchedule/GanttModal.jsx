import React, { useEffect, useState, useRef } from "react";
import { Modal, Card, Typography, Empty } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "tailwindcss/tailwind.css";
import "./GanttModal.css";
import { Icon } from "@iconify/react";

const { Title } = Typography;

const GanttModal = ({ cases, isOpen, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [columnWidth, setColumnWidth] = useState(80);
  const [totalHours, setTotalHours] = useState(0);
  const containerRef = useRef(null);

  // useEffect(() => {
  //   console.log("Grantt cases", cases);
  // }, [cases]);

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
        name: `${c.patient_firstname} ${c.patient_lastname}`,
        start,
        end,
        progress: 100,
        type: "task",
        case: c,
        isDisabled: true,
        tooltip: null,
        styles: {
          backgroundColor: "#0369A1",
          backgroundSelectedColor: "#0369A1",
          progressColor: "#0369A1",
          progressSelectedColor: "#0369A1",
          barCornerRadius: 8,
          barFill: 80,
        },
        fontSize: "text-lg",
      };
    });

    setTasks(formattedCases);
  }, [cases]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

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

      window.addEventListener("resize", calculateWidth);

      return () => {
        window.removeEventListener("resize", calculateWidth);
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, totalHours]);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width="100%"
      centered
      className="gantt-modal gantt-h"
      closable={false}
      styles={{
        padding: 0,
        height: "90vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      title={
        <div className="flex justify-between items-center w-full pl-2">
          <Title level={4} className="text-indigo-700 mt-5">
            ห้อง {cases[0]?.room_name}
          </Title>
          <CloseOutlined
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 cursor-pointer text-lg"
          />
        </div>
      }
    >
      <div className="flex-1 flex py-4 px-1 overflow-hidden h-full">
        <Card className="gantt-card flex-1 w-full h-full rounded-lg shadow-sm border border-gray-200 [&_.ant-card-body]:p-0 flex flex-col">
          {tasks.length > 0 ? (
            <div
              ref={containerRef}
              className="flex-1 w-full overflow-hidden flex flex-col h-full"
            >
              <Gantt
                tasks={tasks}
                viewMode={ViewMode.Hour}
                columnWidth={columnWidth}
                listCellWidth="160px"
                rowHeight={60}
                barCornerRadius={4}
                ganttHeight="100%"
                headerHeight={80}
                fontSize="14px"
                todayColor="rgba(99, 102, 241, 0.1)"
                barFill={80}
                preStepsCount={3}
                locale="th"
                TooltipContent={Tooltip}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <Empty
                description="ไม่พบข้อมูลการผ่าตัด"
                className="text-gray-500"
              />
            </div>
          )}
        </Card>
      </div>
    </Modal>
  );
};

const Tooltip = ({ task }) => {
  return (
    <div className="p-2 bg-white border border-gray-300 rounded-md shadow-md text-gray-800">
      <p className="text-sm font-semibold tracking-wide">
        {new Date(task.start).toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        -{" "}
        {new Date(task.end).toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p className="text-sm text-gray-600">
        {task.case.doctor_prefix}
        {task.case.doctor_firstname} {task.case.doctor_lastname}
      </p>
    </div>
  );
};

export default GanttModal;
