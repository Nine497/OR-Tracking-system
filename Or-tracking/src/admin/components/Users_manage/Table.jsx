import React, { useState, useEffect } from "react";
import { Input, Table, notification, Tooltip, Switch } from "antd";
import { Icon } from "@iconify/react";
import axiosInstance from "../../api/axiosInstance";
import { Spin } from "antd";
import PermissionModal from "./PermissionModal";
import { Button } from "antd";

function UsersTable() {
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageSize: 6, current: 1 });
  const [reloadTrigger, setReloadTrigger] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
          page: 1,
        },
      });

      const dataWithKeys = Array.isArray(response.data?.data)
        ? response.data.data.map((item) => ({
            ...item,
            key: item.staff_id,
          }))
        : [];

      setFilteredData(dataWithKeys);
      setPagination({
        ...pagination,
        total: response.data.totalRecords,
      });
    } catch (error) {
      console.error("Error searching users:", error);
      notification.error({
        message: "Error searching users",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActiveToggle = async (record, checked) => {
    try {
      const token = localStorage.getItem("jwtToken");

      const response = await axiosInstance.put(
        `/staff/isActive/${record.staff_id}`,
        {
          isActive: checked,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Success",
          description: `User status updated to ${
            checked ? "Active" : "Inactive"
          }`,
        });

        setReloadTrigger((prev) => !prev);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      notification.error({
        message: "Error",
        description: "Failed to update status.",
      });
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
            search: searchTerm,
            limit: pagination.pageSize,
            page: pagination.current,
          },
        });

        const dataWithKeys = Array.isArray(response.data?.data)
          ? response.data.data.map((item) => ({
              ...item,
              key: item.staff_id,
            }))
          : [];

        setFilteredData(dataWithKeys);
        setPagination({
          ...pagination,
          total: response.data.totalRecords,
        });
      } catch (error) {
        console.error("Error fetching users:", error);
        notification.error({
          message: "Error fetching users",
          description: error.message,
        });
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    };

    fetchData();
  }, [pagination.current, searchTerm, reloadTrigger]);

  useEffect(() => {
    console.log("filteredData : ", filteredData);
  }, [filteredData]);

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

  const handlePermission = (record) => {
    setSelectedUser(record);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
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
      render: (text, record) => (
        <span className="text-base font-normal">
          {record.firstname} {record.lastname}
        </span>
      ),
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
              <Button
                type="primary"
                icon={
                  <Icon icon="solar:user-outline" className="mr-2 w-4 h-4" />
                }
                onClick={() => handlePermission(record)}
                className="w-full sm:w-auto"
              >
                <span className="font-medium text-base">Permission</span>
              </Button>
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
        <Button
          type="default"
          icon={<Icon icon="mdi:reload" className="mr-2 w-4 h-4" />}
          onClick={() => {
            setSearchTerm("");
            setPagination({ ...pagination, current: 1 });
            setReloadTrigger((prev) => !prev);
          }}
          className="w-full sm:w-auto"
        >
          <span className="font-medium ml-2 text-lg">Reload Data</span>
        </Button>
      </div>

      <div className="w-full h-full mt-4 overflow-x-auto">
        <Spin spinning={loading} size="large">
          <Table
            dataSource={filteredData}
            columns={columns}
            loading={loading}
            pagination={{
              pageSize: pagination.pageSize,
              current: pagination.current,
              total: pagination.total,
              onChange: handlePaginationChange,
              showTotal: (total) => `Total ${total} items`,
            }}
          />
        </Spin>
      </div>
      <PermissionModal
        visible={modalVisible}
        staff={selectedUser}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default UsersTable;
