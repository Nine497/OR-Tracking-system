import React, { useState, useEffect } from "react";
import { Input, Table, notification, Tooltip, Switch } from "antd";
import { Icon } from "@iconify/react";
import axiosInstance from "../../api/axiosInstance";
import { Spin } from "antd";
import PermissionModal from "./PermissionModal";
import { Button } from "antd";
import dayjs from "dayjs";

function UsersTable() {
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageSize: 6, current: 1 });
  const [reloadTrigger, setReloadTrigger] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dataLastestUpdated, setDataLastestUpdated] = useState(null);

  const handleSearch = async (value) => {
    setSearchTerm(value);
    setPagination({ ...pagination, current: 1 });
    setLoading(true);

    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axiosInstance.get("/staff", {
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
        const response = await axiosInstance.get("/staff", {
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
        setDataLastestUpdated(dayjs().format("HH:mm A"));
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
      title: <span className="text-base font-bold">ชื่อผู้ใช้</span>,
      dataIndex: "username",
      key: "username",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">ชื่อ - นามสกุล</span>,
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <span className="text-base font-normal">
          {record.firstname} {record.lastname}
        </span>
      ),
    },
    {
      title: <span className="text-base font-bold">วันที่สร้าง</span>,
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => (
        <span className="text-base font-normal">
          {new Date(text).toLocaleString()}
        </span>
      ),
    },
    {
      title: <span className="text-base font-bold">จัดการ</span>,
      key: "action",
      render: (_, record) => (
        <div className="flex flex-between items-center space-x-4">
          <Tooltip title="จัดการสิทธิ์การเข้าถึง">
            <div>
              <Button
                type="primary"
                icon={
                  <Icon icon="solar:user-outline" className="mr-2 w-4 h-4" />
                }
                onClick={() => handlePermission(record)}
                className="w-full sm:w-auto"
              >
                <span className="font-medium text-base">จัดการสิทธิ์</span>
              </Button>
            </div>
          </Tooltip>

          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg">
            <Tooltip
              title={
                record.isActive
                  ? "คลิกเพื่อปิดใช้งานบัญชี"
                  : "คลิกเพื่อเปิดใช้งานบัญชี"
              }
            >
              <Switch
                size="small"
                className="bg-gray-300"
                checked={record.isActive}
                onChange={(checked) => handleActiveToggle(record, checked)}
              />
            </Tooltip>
            <span className="font-medium text-base text-gray-700">
              เปิดใช้งานบัญชี
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col p-7 w-full h-full gap-4">
      <div className="bg-gray-100 w-full rounded-lg flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 px-5 sm:px-10 py-4">
        <Input
          placeholder="Search by user number, user name, full name..."
          className="w-full sm:w-1/3 h-10 text-base"
          prefix={<Icon icon="mingcute:search-line" className="mr-2 w-4 h-4" />}
          onChange={(e) => handleSearch(e.target.value)}
          value={searchTerm}
        />
        <Button
          type="default"
          icon={<Icon icon="mdi:reload" className="w-4 h-4" />}
          onClick={() => {
            setSearchTerm("");
            setPagination({ ...pagination, current: 1 });
            setReloadTrigger((prev) => !prev);
          }}
          className="w-full sm:w-auto"
          size="large"
        >
          <span className="font-medium text-lg">อัพเดท</span>
        </Button>
      </div>
      <div className="ml-auto text-right">
        <div className="text-gray-500 text-sm">
          ข้อมูลอัพเดทเมื่อ: {dataLastestUpdated}
        </div>
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
