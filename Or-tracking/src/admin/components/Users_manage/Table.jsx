import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input, Table, notification, Tooltip, Switch } from "antd";
import CustomButton from "../CustomButton";
import { Icon } from "@iconify/react";
import axiosInstance from "../../api/axiosInstance";

function UsersTable() {
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageSize: 6, current: 1 });

  const handleSearch = async (value) => {
    setSearchTerm(value);
    setPagination({ ...pagination, current: 1 });
    setLoading(true);

    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axiosInstance.get("/staff", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: value,
          limit: pagination.pageSize,
          page: pagination.current,
        },
      });

      setFilteredData(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
      notification.error({ message: "Error searching users", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get("/staff", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: pagination.pageSize,
            page: pagination.current,
          },
        });

        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        notification.error({ message: "Error fetching users", description: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pagination.current]);

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

  const columns = [
    {
      title: <span className="text-base font-bold">#</span>,
      dataIndex: "staff_id",
      key: "staff_id",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">Username</span>,
      dataIndex: "username",
      key: "username",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">Full Name</span>,
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => <span className="text-base font-normal">{record.firstname} {record.lastname}</span>,
    },
    {
      title: <span className="text-base font-bold">Created At</span>,
      dataIndex: "created_at",
      key: "created_at",
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
                icon={<Icon icon="solar:user-outline" className="mr-2 w-4 h-4" />}
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
              checked={record.isActive}
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
          onChange={(e) => handleSearch(e.target.value)}
          value={searchTerm}
        />
        <CustomButton
          variant="white"
          icon={<Icon icon="mdi:reload" className="mr-2 w-4 h-4" />}
          onClick={() => setSearchTerm("")}
        >
          <span className="font-medium ml-2 text-lg">Reload Data</span>
        </CustomButton>
      </div>

      <div className="w-full h-full mt-4">
        <Table
          dataSource={filteredData}
          columns={columns}
          pagination={{
            pageSize: pagination.pageSize,
            current: pagination.current,
            onChange: handlePaginationChange,
          }}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default UsersTable;
