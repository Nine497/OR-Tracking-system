import React from "react";
import { Table, Input, Tooltip } from "antd";
import { Icon } from "@iconify/react";
import CustomButton from "../CustomButton";
import { useState, useEffect } from "react";
import UpdateModal from "./UpdateModal";

const dataSource = [
  {
    caseId: "C001",
    surgeryDate: "2024-12-10",
    status: "Before treatment",
    roomName: "Room A",
    doctorName: "John Smith",
    patientId: 101,
    hnCode: "HN1234",
    patientName: "Jane Doe",
    expirationTime: "2024-12-15T12:00:00Z",
    createdAt: "2024-12-01T08:00:00Z",
    createdBy: "admin",
    surgeryCaseLinksId: "L001",
    jwtToken: "abc123",
  },
  {
    caseId: "C002",
    surgeryDate: "2024-12-09",
    status: "Transferred to the operating room",
    roomName: "Room B",
    doctorName: "Alice Wonderland",
    patientId: 102,
    hnCode: "HN5678",
    patientName: "Robert Brown",
    expirationTime: "2023-12-15T12:00:00Z",
    createdAt: "2022-12-01T08:00:00Z",
    createdBy: "admin",
    surgeryCaseLinksId: "L001",
    jwtToken: "abc123",
  },
  {
    caseId: "C003",
    surgeryDate: "2024-12-08",
    status: "Undergoing the procedure",
    roomName: "Room C",
    doctorName: "Charlie White",
    patientId: 103,
    hnCode: "HN91011",
    patientName: "Emily Green",
    expirationTime: "2024-12-18T12:00:00Z",
    createdAt: "2024-12-05T09:00:00Z",
    createdBy: "admin2",
    surgeryCaseLinksId: "L002",
    jwtToken: "def456",
  },
  {
    caseId: "C004",
    surgeryDate: "2024-12-07",
    status: "Procedure completed",
    roomName: "Room D",
    doctorName: "Eve Black",
    patientId: 104,
    hnCode: "HN1213",
    patientName: "Michael Johnson",
    expirationTime: null,
    createdAt: null,
    createdBy: null,
    surgeryCaseLinksId: null,
    jwtToken: null,
  },
  {
    caseId: "C005",
    surgeryDate: "2024-12-06",
    status: "Patient returned to the recovery room",
    roomName: "Room E",
    doctorName: "Daniel Gray",
    patientId: 105,
    hnCode: "HN1415",
    patientName: "Sophia Brown",
    expirationTime: null,
    createdAt: null,
    createdBy: null,
    surgeryCaseLinksId: null,
    jwtToken: null,
  },
];

function CaseTable() {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);

  const openStatusModal = (record) => {
    setSelectedRecord(record);
    setIsStatusModalVisible(true);
  };

  const closeStatusModal = () => {
    setSelectedRecord(null);
    setIsStatusModalVisible(false);
  };

  const openLinkModal = (record) => {
    setSelectedRecord(record);
    setIsLinkModalVisible(true);
  };

  const closeLinkModal = () => {
    setSelectedRecord(null);
    setIsLinkModalVisible(false);
  };

  const columns = [
    {
      title: <span className="text-base font-bold">#</span>,
      dataIndex: "caseId",
      key: "caseId",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">Patient Name</span>,
      dataIndex: "patientName",
      key: "patientName",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">Doctor</span>,
      dataIndex: "doctorName",
      key: "doctorName",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">Room</span>,
      dataIndex: "roomName",
      key: "roomName",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">Surgery Date</span>,
      dataIndex: "surgeryDate",
      key: "surgeryDate",
      render: (text) => (
        <span className="text-base font-normal">
          {new Date(text).toLocaleString()}
        </span>
      ),
    },
    {
      title: <span className="text-base font-bold">Link</span>,
      key: "linkconfig",
      render: (_, record) => (
        <div className="flex items-center justify-center">
          <Tooltip title="Copy Link">
            <div>
              <CustomButton
                variant="default"
                onClick={() => openLinkModal(record)}
                icon={<Icon icon="lucide:copy" />}
              >
                <span className="font-medium text-base">Config</span>
              </CustomButton>
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: <span className="text-base font-bold">Status</span>,
      key: "status",
      render: (_, record) => (
        <div className="flex items-center justify-center">
          <Tooltip title="Update Link Status">
            <div>
              <CustomButton
                variant="primary"
                onClick={() => openStatusModal(record)}
                icon={<Icon icon="line-md:link" className="mr-2 w-4 h-4" />}
              >
                <span className="font-medium text-base">Update</span>
              </CustomButton>
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: <span className="text-base font-bold">Action</span>,
      key: "action",
      render: (_, record) => (
        <div className="flex items-center justify-center">
          <Tooltip title="Edit Record">
            <div>
              <CustomButton
                variant="primary"
                onClick={() => handleEditRecord(record)}
                icon={<Icon icon="lucide:edit" className="mr-2 w-4 h-4" />}
              >
                <span className="font-medium text-base">Edit</span>
              </CustomButton>
            </div>
          </Tooltip>
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
          prefix={<Icon icon="mingcute:search-line" />}
        />
        <CustomButton
          variant="white"
          icon={<Icon icon="mdi:reload" className="mr-2 w-4 h-4" />}
        >
          <span className="font-medium ml-2 text-lg">Reload Data</span>
        </CustomButton>
      </div>
      <div className="w-full h-full mt-4 overflow-x-auto">
        <Table
          dataSource={dataSource.map((item) => ({ ...item, key: item.caseId }))}
          columns={columns}
          pagination={{ pageSize: 6 }}
        />
      </div>
      <UpdateModal
        key={selectedRecord?.caseId + "status"}
        visible={isStatusModalVisible}
        record={selectedRecord}
        onClose={closeStatusModal}
        type="status"
      />

      <UpdateModal
        key={selectedRecord?.caseId + "link"}
        visible={isLinkModalVisible}
        record={selectedRecord}
        onClose={closeLinkModal}
        type="link"
      />
    </div>
  );
}

export default CaseTable;
