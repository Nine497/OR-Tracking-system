import { Tabs } from "antd";
import Schedule from "../components/Calendar/CalendarSchedule";
import Table from "../components/Calendar/Table";

export default function Calendar() {
  const items = [
    {
      key: "1",
      label: <span className="text-base font-semibold">Calendar</span>,
      children: <Schedule />,
    },
    {
      key: "2",
      label: <span className="text-base font-semibold">Table</span>,
      children: <Table />,
    },
  ];

  const onChange = (key) => {
    console.log("Selected Tab:", key);
  };

  return (
    <>
      <div className="w-full p-6 bg-white rounded-lg min-h-[500px]">
        <h2 className="text-xl font-bold text-gray-800">Case Schedule</h2>
        <Tabs defaultActiveKey="1" items={items} />
      </div>
    </>
  );
}
