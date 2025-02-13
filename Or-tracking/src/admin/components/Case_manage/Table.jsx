import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Select,
  notification,
  Switch,
  Radio,
  Flex,
} from "antd";
import { Icon } from "@iconify/react";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import UpdateModal from "./UpdateModal";
import StatusUpdateForm from "./Status_update";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
  const [pagination, setPagination] = useState({ pageSize: 7, current: 1 });
  const [doctorSelectedOption, setDoctorSelectedOption] = useState(null);
  const [doctorsData, setDoctorsData] = useState([]);
  const [allStatus, setAllStatus] = useState([]);
  const [allORrooms, setAllORrooms] = useState([]);
  const [dataLastestUpdated, setDataLastestUpdated] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const { permissions } = useAuth();
  const [activeSelected, setActiveSelected] = useState(null);

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

  const copyLink = (linkUrl, pin_decrypted, patient_fullname) => {
    if (!linkUrl || !pin_decrypted) {
      notification.warning({
        message: "ไม่มีข้อมูลให้คัดลอก กรุณาสร้างลิงก์และ PIN ก่อน",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
      return;
    }

    const textToCopy = `คุณ ${patient_fullname}\nURL: ${linkUrl}\nPIN: ${pin_decrypted}`;

    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);

    try {
      textArea.select();
      document.execCommand("copy");

      notification.success({
        message: "ลิงก์และ PIN ได้ถูกคัดลอกไปยังคลิปบอร์ดของคุณแล้ว",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    } catch (err) {
      notification.error({
        message: "ไม่สามารถคัดลอกข้อมูลได้ กรุณาคัดลอกด้วยตนเอง",
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

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchData = async (resetPage = false) => {
    setFilteredData([]);
    try {
      setLoadingCases(true);
      console.log("doctorSelectedOption", doctorSelectedOption);
      console.log("activeSelected", activeSelected);
      console.log("searchTerm", searchTerm);

      const response = await axiosInstanceStaff.get("/surgery_case/", {
        params: {
          doctor_id: doctorSelectedOption || null,
          isActive: activeSelected ?? null,
          search: searchTerm || null,
          limit: pagination.pageSize,
          page: resetPage ? 1 : pagination.current,
        },
      });

      console.log("All Data : ", response.data?.data?.length);
      console.log("Total Records: ", response.data.totalRecords);
      console.log("Total Pages: ", response.data.totalPages);

      const dataWithKeys = Array.isArray(response.data?.data)
        ? response.data.data.map((item) => ({
            ...item,
            key: item.surgery_case_id,
          }))
        : [];

      const totalPages = response.data.totalPages || 1;
      const newPage =
        resetPage || pagination.current > totalPages ? 1 : pagination.current;

      setFilteredData(dataWithKeys);
      setPagination({
        ...pagination,
        current: newPage,
        total: response.data.filteredCount,
      });

      setDataLastestUpdated(dayjs().format("HH:mm A"));
    } catch (error) {
      console.error("Error fetching cases:", error);
      notification.error({
        message: "ไม่สามารถค้นหาเคสผ่าตัดได้ กรุณาลองใหม่อีกครั้ง",
        placement: "topRight",
        duration: 2,
      });
    } finally {
      setTimeout(() => {
        setLoadingCases(false);
      }, 600);
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
        console.log("response.data:", response.data);
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
    fetchData(true);
  }, [searchTerm, activeSelected, doctorSelectedOption]);

  useEffect(() => {
    fetchData();
  }, [pagination.current]);

  useEffect(() => {
    fetchORroomData();
    fetchStatusData();
    fetchDoctorsData();
  }, []);

  const handleActiveToggle = async (record, checked) => {
    try {
      const response = await axiosInstanceStaff.patch(
        `/surgery_case/isActive/${record.surgery_case_id}`,
        {
          isActive: checked,
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "สถานะเคสผ่าตัดถูกอัปเดตแล้ว",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
        fetchData(true);
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

  const columns = [
    {
      title: <span className="text-base font-semibold">HN</span>,
      dataIndex: "hn_code",
      key: "hn_code",
      align: "left",
      width: 100,
      ellipsis: true,
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-semibold">ห้องผ่าตัด</span>,
      dataIndex: "room_name",
      key: "room_name",
      align: "left",
      width: 150,
      render: (_, record) => (
        <OR_roomUpdateForm
          record={record}
          allORrooms={allORrooms}
          fetchTable={fetchData}
        />
      ),
    },
    {
      title: <span className="text-base font-semibold">วันที่ผ่าตัด</span>,
      dataIndex: "surgery_start_time",
      key: "surgery_start_time",
      align: "left",
      width: 130,
      sorter: (a, b) =>
        dayjs(a.surgery_start_time).unix() - dayjs(b.surgery_start_time).unix(),
      showSorterTooltip: false,
      render: (text) => (
        <span className="text-base font-normal">
          {dayjs(text).format("YYYY/MM/DD")}
        </span>
      ),
    },
    {
      title: <span className="text-base font-bold">อัปเดตสถานะ</span>,
      dataIndex: "status_id",
      key: "status_id",
      align: "left",
      width: 150,
      render: (_, record) => (
        <StatusUpdateForm record={record} allStatus={allStatus} />
      ),
    },
    {
      title: <span className="text-base font-bold">สถานะ</span>,
      key: "status",
      align: "left",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<Icon icon="mdi:eye" className="h-5" />}
          onClick={() => openStatusModal(record)}
          className="flex items-center gap-2"
        >
          ประวัติ
        </Button>
      ),
    },
    {
      title: permissions.includes("5004") ? (
        <span className="text-base font-bold">Link</span>
      ) : null,
      dataIndex: "status_id",
      key: "status_id",
      align: "left",
      width: 180,
      render: (_, record) => {
        const hasPermission5004 = permissions.includes("5004");
        if (!hasPermission5004) return null;

        return (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="default"
              icon={<Icon icon="lucide:settings" />}
              onClick={() => openLinkModal(record)}
              className="flex items-center gap-1"
            >
              ตั้งค่า
            </Button>
            {record.link_id &&
            record.link_active === true &&
            new Date(record.expiration_time) > Date.now() ? (
              <Button
                type="default"
                icon={<Icon icon="bx:bx-link" />}
                onClick={() =>
                  copyLink(
                    `${BASE_URL}ptr?link=${record.link_id}`,
                    record.pin_decrypted,
                    `${record.patient_firstname} ${record.patient_lastname}`
                  )
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
      width: 200,
      render: (_, record) => (
        <div className="flex flex-between items-center space-x-4">
          <div className="w-full sm:w-auto">
            <Button
              type="primary"
              icon={<Icon icon="lucide:edit" className="mr-2 w-4 h-4" />}
              onClick={() => handleEditRecord(record)}
              className="flex items-center gap-2"
            >
              <span className="font-medium text-base">แก้ไข</span>
            </Button>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg">
            <Switch
              size="small"
              className="bg-gray-300"
              checked={record.isactive}
              onChange={(checked) => handleActiveToggle(record, checked)}
            />
            <span className="font-medium text-base text-gray-700">
              เปิดใช้งาน
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col p-2 sm:p-7 w-full h-full gap-4">
      <div className="bg-gray-100 w-full rounded-lg flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 px-2 sm:px-10 py-4">
        <Input
          placeholder="ค้นหาด้วย HN, ชื่อผู้ป่วย..."
          className="w-full sm:w-1/4 h-10 text-base"
          prefix={<Icon icon="mingcute:search-line" />}
          onChange={handleInputChange}
          value={searchTerm}
        />
        <Select
          className="w-full sm:w-1/4 h-10"
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

        <Radio.Group
          buttonStyle="solid"
          className="w-full sm:w-1/4"
          value={activeSelected}
          onChange={(e) => handleActiveChange(e.target.value)}
        >
          <Radio.Button value={null}>ทั้งหมด</Radio.Button>
          <Radio.Button value={true}>เปิดใช้งาน</Radio.Button>
          <Radio.Button value={false}>ไม่เปิดใช้งาน</Radio.Button>
        </Radio.Group>

        <Button
          type="default"
          icon={<Icon icon="mdi:reload" className="w-4 h-4" />}
          onClick={() => {
            setSearchTerm("");
            fetchData();
          }}
          className="w-full sm:w-auto"
          size="large"
        >
          <span className="font-medium text-lg">อัปเดต</span>
        </Button>
      </div>

      <div className="ml-auto text-right">
        <div className="text-gray-500 text-sm">
          ข้อมูลอัปเดตเมื่อ: {dataLastestUpdated}
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

const OR_roomUpdateForm = ({ record, allORrooms, fetchTable }) => {
  const handleChange = async (value) => {
    try {
      const response = await axiosInstanceStaff.put(
        `surgery_case/or_room/${record.surgery_case_id}`,
        {
          operating_room_id: value,
        }
      );

      notification.success({
        message: "อัปเดตห้องสำเร็จ",
      });

      fetchTable();
    } catch (error) {
      console.error("Update error:", error);

      notification.error({
        message: "เกิดข้อผิดพลาด",
        description:
          error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตห้อง",
      });
    }
  };

  return (
    <Select
      placeholder="เลือกห้อง"
      className="w-full"
      onBlur={(e) => e.target.blur()}
      defaultValue={record?.operating_room_id}
      w
      onChange={handleChange}
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
