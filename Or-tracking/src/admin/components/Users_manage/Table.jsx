import React, { useState, useEffect } from "react";
import { Input, Table, Switch, notification, Radio } from "antd";
import { Icon } from "@iconify/react";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import { Spin } from "antd";
import PermissionModal from "./PermissionModal";
import EditStaffModal from "./EditStaff";
import { Button } from "antd";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

function UsersTable(refreshKey) {
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageSize: 6, current: 1 });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dataLastestUpdated, setDataLastestUpdated] = useState(null);
  const { permissions, user } = useAuth();
  const [activeSelected, setActiveSelected] = useState(null);
  const [editStaffmodalVisible, setEditStaffmodalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleActiveToggle = async (record, checked) => {
    try {
      const response = await axiosInstanceStaff.put(
        `/staff/isActive/${record.staff_id}`,
        {
          isActive: checked,
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "สถานะผู้ใช้ถูกอัปเดตแล้ว",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });

        fetchData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      notification.error({
        message: "ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่อีกครั้ง",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstanceStaff.get("/staff", {
        params: {
          staff_id: user.id,
          isActive: activeSelected,
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
      const filteredUsers = dataWithKeys.filter(
        (userData) => userData.staff_id !== user.id
      );

      setFilteredData(filteredUsers);
      setPagination({
        ...pagination,
        total: response.data.totalRecords,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      notification.error({
        message: "ข้อผิดพลาดในการดึงข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    } finally {
      setDataLastestUpdated(dayjs().format("HH:mm A"));
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.current, searchTerm, activeSelected]);

  // useEffect(() => {
  //   console.log("filteredData : ", filteredData);
  // }, [filteredData]);

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

  const handlePermission = (record) => {
    setSelectedUser(record);
    setModalVisible(true);
  };

  const handleEditStaff = (record) => {
    setSelectedUser(record);
    setEditStaffmodalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleEditStaffModalClose = () => {
    setEditStaffmodalVisible(false);
    fetchData();
  };

  // useEffect(() => {
  //   console.log("permissions", permissions);
  // }, []);

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
          {dayjs(text).tz("Asia/Bangkok").format("YYYY/MM/DD HH:mm")}
        </span>
      ),
    },
    {
      title: <span className="text-base font-bold">จัดการ</span>,
      key: "action",
      render: (_, record) => {
        const hasPermission11 = permissions.includes("11");

        return (
          <div className="flex flex-between items-center space-x-4">
            {!hasPermission11 ? (
              <div>
                <Button
                  type="primary"
                  icon={
                    <Icon
                      icon="weui:setting-filled"
                      className="mr-1 w-4 h-4 text-white"
                    />
                  }
                  onClick={() => handleEditStaff(record)}
                  className="w-full sm:w-auto"
                >
                  <span className="font-medium text-base">แก้ไขข้อมูล</span>
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <Button
                    type="primary"
                    icon={
                      <Icon
                        icon="weui:setting-filled"
                        className="mr-1 w-4 h-4 text-white"
                      />
                    }
                    onClick={() => handleEditStaff(record)}
                    className="w-full sm:w-auto"
                  >
                    <span className="font-medium text-base">แก้ไขข้อมูล</span>
                  </Button>
                </div>
                <div>
                  <Button
                    type="primary"
                    icon={
                      <Icon
                        icon="weui:setting-filled"
                        className="mr-1 w-4 h-4 text-white"
                      />
                    }
                    onClick={() => handlePermission(record)}
                    className="w-full sm:w-auto"
                  >
                    <span className="font-medium text-base">จัดการสิทธิ์</span>
                  </Button>
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg">
                  <Switch
                    size="small"
                    className="bg-gray-300"
                    checked={record.isActive}
                    onChange={(checked) => handleActiveToggle(record, checked)}
                  />
                  <span className="font-medium text-base text-gray-700">
                    เปิดใช้งานบัญชี
                  </span>
                </div>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col p-1 sm:p-7 w-full h-full gap-4">
      <div className="bg-gray-100 w-full rounded-lg flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 px-2 sm:px-10 py-4">
        <Input
          placeholder="ค้นหาด้วยหมายเลขผู้ใช้, ชื่อผู้ใช้, ชื่อ-นามสกุล..."
          className="w-full sm:w-1/3 h-10 text-base"
          prefix={<Icon icon="mingcute:search-line" className="mr-2 w-4 h-4" />}
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          allowClear
        />

        <Radio.Group
          block
          buttonStyle="solid"
          className="w-full sm:w-1/3"
          value={activeSelected}
          onChange={(e) => {
            setActiveSelected(e.target.value);
            setPagination({
              ...pagination,
              current: 1,
            });
          }}
          size="middle sm:small"
        >
          {/* <Radio.Button value={null}>ทั้งหมด</Radio.Button>
          <Radio.Button value={true}>เปิดใช้งาน</Radio.Button>
          <Radio.Button value={false}>ปิดใช้งาน</Radio.Button> */}

          <Radio.Button
            value={null}
            className="flex justify-center items-center px-0"
          >
            <span className="flex w-full text-center items-center text-xs md:text-base md:gap-2 gap-1 justify-center">
              <Icon
                icon="mdi:checkbox-multiple-marked"
                className="md:w-4 md:h-4 w-3 h-3"
              />
              ทั้งหมด
            </span>
          </Radio.Button>
          <Radio.Button
            value={true}
            className="flex justify-center items-center"
          >
            <span className="flex w-full text-center items-center text-xs md:text-base gap-2 justify-center">
              <Icon
                icon="mdi:checkbox-marked-circle-outline"
                className="md:w-4 md:h-4 w-3 h-3"
              />
              เปิดใช้งาน
            </span>
          </Radio.Button>
          <Radio.Button
            value={false}
            className="flex justify-center items-center"
          >
            <span className="flex w-full text-center items-center text-xs md:text-base gap-2 justify-center">
              <Icon
                icon="mdi:close-circle-outline"
                className="md:w-4 md:h-4 w-3 h-3"
              />
              ปิดใช้งาน
            </span>
          </Radio.Button>
        </Radio.Group>

        <Button
          type="default"
          icon={<Icon icon="mdi:reload" className="w-4 h-4" />}
          onClick={() => {
            fetchData();
          }}
          className="w-full sm:w-auto"
          size="large md:medium"
        >
          <span className="font-medium text-sm md:text-base">อัปเดต</span>
        </Button>
      </div>
      <div className="ml-auto text-right">
        <div className="text-gray-500 text-sm">
          ข้อมูลอัปเดตเมื่อ: {dataLastestUpdated}
        </div>
      </div>

      <div className="w-full h-full mt-4 overflow-x-auto">
        <Spin spinning={loading} size="middle">
          <Table
            dataSource={filteredData}
            columns={columns}
            loading={loading}
            pagination={{
              pageSize: pagination.pageSize,
              current: pagination.current,
              total: pagination.total,
              onChange: handlePaginationChange,
              showTotal: (total) => `ทั้งหมด ${total} ผู้ใช้`,
              showSizeChanger: false,
            }}
          />
        </Spin>
      </div>
      <PermissionModal
        visible={modalVisible}
        staff={selectedUser}
        onClose={handleModalClose}
      />

      <EditStaffModal
        visible={editStaffmodalVisible}
        staff={selectedUser}
        onClose={handleEditStaffModalClose}
      />
    </div>
  );
}

export default UsersTable;
