import React, { useState } from "react";
import { Table, Input, Tooltip, Switch } from "antd";
import { Icon } from "@iconify/react";
import CustomButton from "../CustomButton";
import PermissionModal from "./PermissionModal";

function UsersTable() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const dataSource = [
    {
      key: "1",
      userNumber: "001",
      userName: "johndoe",
      fullName: "John Doe",
      createdAt: "2024-12-10 08:30:00",
    },
    {
      key: "2",
      userNumber: "002",
      userName: "janedoe",
      fullName: "Jane Doe",
      createdAt: "2024-12-09 14:45:00",
    },
    {
      key: "3",
      userNumber: "003",
      userName: "alicew",
      fullName: "Alice Wonderland",
      createdAt: "2024-12-08 10:15:00",
    },
    {
      key: "4",
      userNumber: "004",
      userName: "bobsmith",
      fullName: "Bob Smith",
      createdAt: "2024-12-07 16:00:00",
    },
    {
      key: "5",
      userNumber: "005",
      userName: "charlieb",
      fullName: "Charlie Brown",
      createdAt: "2024-12-06 11:45:00",
    },
    {
      key: "6",
      userNumber: "006",
      userName: "danielk",
      fullName: "Daniel King",
      createdAt: "2024-12-05 13:30:00",
    },
    {
      key: "7",
      userNumber: "007",
      userName: "emilyr",
      fullName: "Emily Rose",
      createdAt: "2024-12-04 09:00:00",
    },
    {
      key: "8",
      userNumber: "008",
      userName: "frankh",
      fullName: "Frank Harris",
      createdAt: "2024-12-03 14:20:00",
    },
    {
      key: "9",
      userNumber: "009",
      userName: "georgem",
      fullName: "George Michael",
      createdAt: "2024-12-02 17:10:00",
    },
    {
      key: "10",
      userNumber: "010",
      userName: "hannahw",
      fullName: "Hannah White",
      createdAt: "2024-12-01 12:50:00",
    },
    {
      key: "11",
      userNumber: "011",
      userName: "ianp",
      fullName: "Ian Parker",
      createdAt: "2024-11-30 15:40:00",
    },
    {
      key: "12",
      userNumber: "012",
      userName: "jackl",
      fullName: "Jack Lee",
      createdAt: "2024-11-29 10:10:00",
    },
    {
      key: "13",
      userNumber: "013",
      userName: "kareng",
      fullName: "Karen Green",
      createdAt: "2024-11-28 18:25:00",
    },
    {
      key: "14",
      userNumber: "014",
      userName: "leonardc",
      fullName: "Leonard Cohen",
      createdAt: "2024-11-27 08:45:00",
    },
    {
      key: "15",
      userNumber: "015",
      userName: "michaelt",
      fullName: "Michael Turner",
      createdAt: "2024-11-26 20:10:00",
    },
    {
      key: "16",
      userNumber: "016",
      userName: "nancyh",
      fullName: "Nancy Hill",
      createdAt: "2024-11-25 11:35:00",
    },
    {
      key: "17",
      userNumber: "017",
      userName: "oliviao",
      fullName: "Olivia Olson",
      createdAt: "2024-11-24 14:50:00",
    },
    {
      key: "18",
      userNumber: "018",
      userName: "paulb",
      fullName: "Paul Brown",
      createdAt: "2024-11-23 19:15:00",
    },
    {
      key: "19",
      userNumber: "019",
      userName: "queent",
      fullName: "Queen Taylor",
      createdAt: "2024-11-22 09:40:00",
    },
    {
      key: "20",
      userNumber: "020",
      userName: "robertp",
      fullName: "Robert Plant",
      createdAt: "2024-11-21 16:30:00",
    },
  ];

  const handlePermission = (record) => {
    setSelectedUser(record);
    setIsModalVisible(true);
  };

  const handleActiveToggle = (record, checked) => {
    console.log(`Active status for ${record.userName}: ${checked}`);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
  };

  const columns = [
    {
      title: <span className="text-base font-bold">#</span>,
      dataIndex: "userNumber",
      key: "userNumber",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">User Name</span>,
      dataIndex: "userName",
      key: "userName",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">Full Name</span>,
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">Created At</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <span className="text-base font-normal">
          {new Date(text).toLocaleString()}
        </span>
      ),
    },
    {
      title: <span className="text-base font-bold">Action</span>,
      key: "action",
      render: (_, record) => (
        <div className="flex flex-between items-center space-x-4">
          <Tooltip title="Manage Permissions">
            <div>
              <CustomButton
                variant="primary"
                icon={
                  <Icon icon="solar:user-outline" className="mr-2 w-4 h-4" />
                }
                onClick={() => handlePermission(record)}
              >
                <span className="font-medium text-base">Permission</span>
              </CustomButton>
            </div>
          </Tooltip>
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg">
            <Switch
              size="small"
              className="bg-gray-300"
              onChange={(checked) => handleActiveToggle(record, checked)}
            />
            <span className="font-medium text-base text-gray-700">Active</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col p-7 w-full h-full gap-6">
      <div className="bg-gray-100 w-full h-fit rounded-lg flex flex-row justify-between items-center px-10">
        <Input
          placeholder="Search by user number, user name, full name..."
          className="w-1/4 h-10 text-base m-3"
          prefix={<Icon icon="mingcute:search-line" className="mr-2 w-4 h-4" />}
        />
        <CustomButton
          variant="white"
          icon={<Icon icon="mdi:reload" className="mr-2 w-4 h-4" />}
        >
          <span className="font-medium ml-2 text-lg">Reload Data</span>
        </CustomButton>
      </div>
      <div className="w-full h-full mt-4">
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={{ pageSize: 6 }}
        />
      </div>

      {isModalVisible && (
        <PermissionModal
          visible={isModalVisible}
          user={selectedUser}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default UsersTable;
