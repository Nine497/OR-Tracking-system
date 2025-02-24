import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Select,
  notification,
  Popconfirm,
  Radio,
  Flex,
  DatePicker,
} from "antd";
import { Icon } from "@iconify/react";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import UpdateModal from "./UpdateModal";
import StatusUpdateForm from "./Status_update";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
function CaseTable() {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ pageSize: 6, current: 1 });
  const [doctorSelectedOption, setDoctorSelectedOption] = useState(null);
  const [doctorsData, setDoctorsData] = useState([]);
  const [allStatus, setAllStatus] = useState([]);
  const [allORrooms, setAllORrooms] = useState([]);
  const [statusSelectedOption, setStatusSelectedOption] = useState(null);
  const [dataLastUpdated, setDataLastUpdated] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const { permissions } = useAuth();
  const [activeSelected, setActiveSelected] = useState(true);
  const { RangePicker } = DatePicker;

  // const handleSearch = async (
  //   isActive = activeSelected,
  //   doctor = doctorSelectedOption,
  //   searchTerms = searchTerm
  // ) => {
  //   setLoadingCases(true);
  //   try {
  //     console.log("searchTerms", searchTerms);
  //     console.log("doctor", doctor);
  //     console.log("isActive", isActive);

  //     const response = await axiosInstanceStaff.get("/surgery_case/", {
  //       params: {
  //         search: searchTerms || "",
  //         doctor_id: doctor || "",
  //         isActive: isActive !== null ? isActive === true : "",
  //         limit: pagination.pageSize,
  //         page: pagination.current,
  //       },
  //     });

  //     const dataWithKeys = Array.isArray(response.data?.data)
  //       ? response.data.data.map((item) => ({
  //           ...item,
  //           key: item.surgery_case_id,
  //         }))
  //       : [];

  //     setFilteredData(dataWithKeys);
  //     const totalPages = response.data.totalPages || 1;
  //     const newPage = pagination.current > totalPages ? 1 : pagination.current;

  //     setPagination((prev) => ({
  //       ...prev,
  //       current: newPage,
  //       total: response.data.totalRecords,
  //     }));
  //   } catch (error) {
  //     notification.error({
  //       message: "ไม่สามารถค้นหาเคสผ่าตัดได้ กรุณาลองใหม่อีกครั้ง",
  //       showProgress: true,
  //       placement: "topRight",
  //       pauseOnHover: true,
  //       duration: 2,
  //     });
  //   } finally {
  //     setLoadingCases(false);
  //   }
  // };

  const handleEditRecord = (record) => {
    navigate(`/admin/case_manage/edit_case?id=${record.surgery_case_id}`);
  };

  const disabledDate = (current) => {
    const today = dayjs();
    return (
      current.isBefore(today.subtract(90, "day")) ||
      current.isAfter(today.add(90, "day"))
    );
  };

  const copyLink = (linkUrl) => {
    if (!linkUrl) {
      notification.warning({
        message: "ไม่มีข้อมูลให้คัดลอก กรุณาสร้างลิงก์ก่อน",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = linkUrl;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);

    try {
      textArea.select();
      document.execCommand("copy");

      notification.success({
        message: "ลิงก์ได้ถูกคัดลอกไปยังคลิปบอร์ดของคุณแล้ว",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    } catch (err) {
      notification.error({
        message: "ไม่สามารถคัดลอกลิงก์ได้ กรุณาคัดลอกด้วยตนเอง",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
      console.error("Copy Error:", err);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

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
    fetchData();
  };

  const handleActiveChange = (value) => {
    setActiveSelected(value);
  };

  const handleSelectChange = (value) => {
    setDoctorSelectedOption(value);
  };

  const handleSelectStatusChange = (value) => {
    setStatusSelectedOption(value);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const fetchData = async () => {
    try {
      setLoadingCases(true);

      const response = await axiosInstanceStaff.get("/surgery_case/", {
        params: {
          doctor_id: doctorSelectedOption,
          status_id: statusSelectedOption,
          isActive: activeSelected,
          search: searchTerm,
          limit: pagination.pageSize,
          page: pagination.current,
        },
      });

      const dataWithKeys = Array.isArray(response.data?.data)
        ? response.data.data.map((item) => ({
            ...item,
            key: item.surgery_case_id,
          }))
        : [];

      console.log("dataWithKeys", dataWithKeys);
      setFilteredData(dataWithKeys);
      setPagination({
        ...pagination,
        total: response.data.totalRecords,
      });
    } catch (error) {
      console.error("Error fetching cases:", error);
      notification.error({
        message: "ไม่สามารถค้นหาเคสผ่าตัดได้ กรุณาลองใหม่อีกครั้ง",
        placement: "topRight",
        duration: 2,
      });
    } finally {
      setDataLastUpdated(dayjs().format("HH:mm A"));
      setTimeout(() => {
        setLoadingCases(false);
      }, 200);
    }
  };

  const fetchORroomData = async () => {
    try {
      const response = await axiosInstanceStaff.get("or_room/");
      if (response.data && Array.isArray(response.data.data)) {
        setAllORrooms(response.data.data);
      } else {
        console.error("Invalid data format received for OR-Rooms.");
      }
    } catch (error) {
      console.error("Error fetching OR-Rooms:", error);
      notification.error({
        message: "ไม่สามารถค้นหาเคสผ่าตัดได้ กรุณาลองใหม่อีกครั้ง",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    }
  };

  const fetchDoctorsData = async () => {
    setLoadingDoctors(true);
    try {
      const response = await axiosInstanceStaff.get("doctor/");
      if (response.data && Array.isArray(response.data.data)) {
        setDoctorsData(response.data.data);
      } else {
        console.error("Invalid data format received for doctors.");
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
      notification.error({
        message: "ไม่สามารถค้นหาเคสผ่าตัดได้ กรุณาลองใหม่อีกครั้ง",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchStatusData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstanceStaff.get(
        "patient/getAllStatus?language_code=th"
      );
      if (response.status === 200 && response.data) {
        // console.log("response.data:", response.data);
        setAllStatus(response.data);
      }
    } catch (err) {
      notification.error({
        message: "ไม่สามารถดึงข้อมูลสถานะได้ กรุณาลองใหม่อีกครั้ง",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    pagination.current,
    searchTerm,
    activeSelected,
    doctorSelectedOption,
    statusSelectedOption,
  ]);

  useEffect(() => {
    fetchORroomData();
    fetchStatusData();
    fetchDoctorsData();
  }, []);

  // const handleActiveToggle = async (record) => {
  //   try {
  //     const response = await axiosInstanceStaff.patch(
  //       `/surgery_case/isActive/${record.surgery_case_id}`,
  //       {
  //         isActive: !record.isactive,
  //       }
  //     );

  //     if (response.status === 200) {
  //       console.log("response", response);
  //       notification.success({
  //         message: "สถานะเคสผ่าตัดถูกอัปเดตแล้ว",
  //         showProgress: true,
  //         placement: "topRight",
  //         pauseOnHover: true,
  //         duration: 2,
  //       });
  //       fetchData();
  //     }
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //     const errorMessage =
  //       error.response?.data?.message ||
  //       "ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่อีกครั้ง";
  //     notification.error({
  //       message: errorMessage,
  //       showProgress: true,
  //       placement: "topRight",
  //       pauseOnHover: true,
  //       duration: 2,
  //     });
  //   }
  // };

  const columns = [
    // {
    //   title: <span className="text-base font-semibold">HN</span>,
    //   dataIndex: "hn_code",
    //   key: "hn_code",
    //   align: "left",
    //   width: 90,
    //   ellipsis: true,
    //   render: (text) => <span className="text-base font-normal">{text}</span>,
    // },
    {
      title: <span className="text-base font-semibold">ชื่อคนไข้</span>,
      dataIndex: "patient_fullname",
      key: "patient_fullname",
      align: "left",
      width: 100,
      ellipsis: true,
      render: (_, record) => (
        <span className="text-base font-normal">
          {record.patient_firstname} {record.patient_lastname}
        </span>
      ),
    },
    {
      title: <span className="text-base font-semibold">การผ่าตัด</span>,
      dataIndex: "operation_name",
      key: "operation_name",
      align: "left",
      width: 130,
      ellipsis: true,
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-semibold">ห้องผ่าตัด</span>,
      dataIndex: "room_name",
      key: "room_name",
      align: "left",
      width: 80,
      render: (_, record) => (
        <OR_roomUpdateForm
          record={record}
          allORrooms={allORrooms}
          fetchTable={fetchData}
          activeSelected={activeSelected}
        />
      ),
    },
    {
      title: <span className="text-base font-semibold">วันที่ผ่าตัด</span>,
      dataIndex: "surgery_start_time",
      key: "surgery_start_time",
      align: "left",
      width: 80,
      sorter: (a, b) =>
        dayjs(a.surgery_start_time).unix() - dayjs(b.surgery_start_time).unix(),
      showSorterTooltip: false,
      render: (text) => (
        <span className="text-base font-normal">
          {dayjs(text).tz("Asia/Bangkok").format("YYYY/MM/DD")}
        </span>
      ),
    },
    {
      title: <span className="text-base font-semibold">เวลา</span>,
      dataIndex: "surgery_time",
      key: "surgery_time",
      align: "left",
      width: 90,
      render: (_, record) => (
        <span className="text-base font-normal">
          {dayjs(record.surgery_start_time).tz("Asia/Bangkok").format("HH:mm")}{" "}
          - {dayjs(record.surgery_end_time).tz("Asia/Bangkok").format("HH:mm")}
        </span>
      ),
    },
    {
      title: <span className="text-base font-bold">อัปเดตสถานะ</span>,
      dataIndex: "status_id",
      key: "status_id",
      align: "left",
      width: 130,
      render: (_, record) => (
        <StatusUpdateForm
          record={record}
          allStatus={allStatus}
          activeSelected={activeSelected}
        />
      ),
    },
    {
      title: <span className="text-base font-bold">สถานะ</span>,
      key: "status",
      align: "left",
      width: 80,
      render: (_, record) => (
        <Button
          loading={loadingCases}
          type="primary"
          icon={<Icon icon="mdi:eye" className="h-5" />}
          onClick={() => openStatusModal(record)}
          className="flex items-center gap-2"
        >
          ประวัติ
        </Button>
      ),
    },

    permissions.includes("21") && {
      title: <span className="text-base font-bold">ลิงก์</span>,
      dataIndex: "status_id",
      key: "status_id",
      align: "left",
      width: 130,
      render: (_, record) => {
        return (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              disabled={activeSelected === false}
              loading={loadingCases}
              type="default"
              icon={<Icon icon="lucide:settings" />}
              onClick={() => openLinkModal(record)}
              className="flex items-center gap-1"
            >
              ตั้งค่า
            </Button>
            {record.link_id &&
            activeSelected === true &&
            record.link_active === true &&
            new Date(record.expiration_time) > Date.now() ? (
              <Button
                type="default"
                icon={<Icon icon="bx:bx-link" />}
                onClick={() =>
                  copyLink(`${BASE_URL}ptr?link=${record.link_id}`)
                }
                className="flex items-center gap-1"
                loading={copyLoading}
              >
                คัดลอก
              </Button>
            ) : null}
          </div>
        );
      },
    },

    {
      title: <span className="text-base font-bold">จัดการ</span>,
      key: "Action",
      align: "left",
      width: 80,
      render: (_, record) => (
        <div className="flex flex-between items-center space-x-4">
          <div className="w-full sm:w-auto">
            <Button
              loading={loadingCases}
              type="primary"
              icon={<Icon icon="lucide:edit" className="w-4 h-4" />}
              onClick={() => handleEditRecord(record)}
              className="flex items-center gap-2"
            >
              <span className="font-medium text-base">แก้ไข</span>
            </Button>
          </div>
          {/* <div className="w-full sm:w-auto">
            <Popconfirm
              title={
                activeSelected === true
                  ? "คุณแน่ใจที่จะลบรายการนี้?"
                  : "คุณแน่ใจที่จะกู้คืนรายการนี้?"
              }
              onConfirm={() => handleActiveToggle(record)}
              okText="ยืนยัน"
              cancelText="ยกเลิก"
              placement="topRight"
            >
              <Button
                loading={loadingCases}
                icon={
                  <Icon
                    icon={
                      activeSelected === true
                        ? "solar:trash-bin-trash-bold"
                        : "grommet-icons:revert"
                    }
                    className="w-4 h-4"
                  />
                }
                className={`flex items-center gap-2 transition-colors border-none !shadow-none ${
                  activeSelected === true
                    ? "bg-red-400 hover:!bg-red-600 text-white hover:!text-white"
                    : "bg-gray-200 hover:!bg-gray-300 hover:!text-black"
                }`}
              >
                <span className="font-medium text-base">
                  {activeSelected === true ? "ลบ" : "กู้คืน"}
                </span>
              </Button>
            </Popconfirm>
          </div> */}
          {/* <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg">
            <Switch
              size="small"
              className="bg-gray-300"
              checked={record.isactive}
              onChange={(checked) => handleActiveToggle(record, checked)}
            />
            <span className="font-medium text-base text-gray-700">
              เปิดใช้งาน
            </span>
          </div> */}
        </div>
      ),
    },
  ].filter(Boolean);

  return (
    <div className="flex flex-col p-2 sm:p-5 w-full h-full gap-4">
      <div className="bg-gray-100">
        <div className="flex flex-row w-full sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-4 px-2 sm:px-10 pt-4">
          <Input
            placeholder="ค้นหาด้วย HN, ชื่อผู้ป่วย..."
            className="w-full p-1 text-base"
            prefix={<Icon icon="mingcute:search-line" />}
            onChange={handleInputChange}
            value={searchTerm}
            allowClear
          />

          <Button
            type="default"
            icon={<Icon icon="mdi:reload" className="w-4 h-4" />}
            onClick={() => {
              fetchData();
            }}
            className="w-full sm:w-auto"
            size="large"
          >
            <span className="font-medium text-lg">อัปเดต</span>
          </Button>
        </div>
            
        <div className="flex flex-row w-full  sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 px-2 sm:px-10 pt-2 pb-3">
          <RangePicker
            className="w-1/5"
            defaultValue={[dayjs(), dayjs().add(7, "day")]}
            disabledDate={disabledDate}
          />

          <Select
            className="w-full sm:w-1/5 h-10"
            placeholder="กรองตามแพทย์"
            value={doctorSelectedOption}
            onChange={handleSelectChange}
          >
            <Select.Option key="none" value="">
              ไม่เลือก
            </Select.Option>
            {doctorsData.map((doctor) => (
              <Select.Option key={doctor.doctor_id} value={doctor.doctor_id}>
                {`${doctor.prefix}${doctor.firstname} ${doctor.lastname}`}
              </Select.Option>
            ))}
          </Select>

          <Select
            className="w-full sm:w-1/5 h-10"
            placeholder="กรองตามสถานะ"
            value={statusSelectedOption}
            onChange={handleSelectStatusChange}
          >
            <Select.Option key="none" value="">
              ไม่เลือก
            </Select.Option>
            {allStatus.map((status) => (
              <Select.Option key={status.status_id} value={status.status_id}>
                {`${status.translated_name}`}
              </Select.Option>
            ))}
          </Select>

          <Radio.Group
            size="middle sm:small"
            block
            buttonStyle="solid"
            className="w-full sm:w-1/5"
            value={activeSelected}
            onChange={(e) => {
              handleActiveChange(e.target.value);
              setPagination({
                ...pagination,
                current: 1,
              });
            }}
          >
            {/* <Radio.Button value={null}>ทั้งหมด</Radio.Button> */}

            <Radio.Button
              value={true}
              className="flex justify-center items-center"
            >
              <span className="flex w-full text-center items-center text-base gap-2 justify-center">
                <Icon
                  icon="material-symbols:check-box-rounded"
                  className="w-4 h-4"
                />
                เคสปัจจุบัน
              </span>
            </Radio.Button>

            <Radio.Button
              value={false}
              className="flex justify-center items-center"
            >
              <span className="flex w-full text-center items-center text-base gap-2 justify-center">
                <Icon icon="entypo:trash" className="w-4 h-4" />
                ถังขยะ
              </span>
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>

      <div className="ml-auto text-right">
        <div className="text-gray-500 text-sm">
          ข้อมูลอัปเดตเมื่อ: {dataLastUpdated}
        </div>
      </div>

      <div className="w-full h-full overflow-x-auto">
        <Table
          dataSource={filteredData}
          columns={columns}
          loading={loadingCases}
          pagination={{
            pageSize: pagination.pageSize,
            current: pagination.current,
            total: pagination.total,
            onChange: handlePaginationChange,
            showTotal: (total) => `ทั้งหมด ${total} เคส`,
            showSizeChanger: false,
          }}
        />
      </div>

      <UpdateModal
        key={selectedRecord?.surgery_case_id + "status"}
        visible={isStatusModalVisible}
        record={selectedRecord}
        onClose={closeStatusModal}
        type="status"
      />

      <UpdateModal
        key={selectedRecord?.surgery_case_id + "link"}
        visible={isLinkModalVisible}
        record={selectedRecord}
        onClose={closeLinkModal}
        type="link"
      />
    </div>
  );
}

const OR_roomUpdateForm = ({
  record,
  allORrooms,
  fetchTable,
  activeSelected,
}) => {
  const [selectedRoom, setSelectedRoom] = useState(record?.operating_room_id);

  useEffect(() => {
    setSelectedRoom(record?.operating_room_id);
  }, [record]);

  const handleChange = async (value) => {
    setSelectedRoom(value);

    try {
      const response = await axiosInstanceStaff.put(
        `surgery_case/or_room/${record.surgery_case_id}`,
        { operating_room_id: value }
      );

      notification.success({ message: "อัปเดตห้องสำเร็จ" });

      await fetchTable();
    } catch (error) {
      console.error("Update error:", error);

      const errorMessage =
        error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตห้อง";

      if (
        errorMessage ===
        "The selected operating room is not available during this time"
      ) {
        notification.warning({
          message: "ช่วงเวลานี้มีการจองห้องผ่าตัดนี้แล้ว",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 5,
        });
      } else {
        notification.error({
          message: "เกิดข้อผิดพลาด",
          description: errorMessage,
        });
      }

      await fetchTable();
    }
  };

  return (
    <Select
      placeholder="เลือกห้อง"
      className="w-full"
      value={selectedRoom}
      onChange={handleChange}
      disabled={!activeSelected}
    >
      {allORrooms.map((room) => (
        <Select.Option
          key={room.operating_room_id}
          value={room.operating_room_id}
        >
          {room.room_name}
        </Select.Option>
      ))}
    </Select>
  );
};

export default CaseTable;
