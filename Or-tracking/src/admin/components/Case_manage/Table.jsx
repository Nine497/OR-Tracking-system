import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Tooltip,
  Spin,
  notification,
  Select,
  FloatButton,
} from "antd";
import { Icon } from "@iconify/react";
import CustomButton from "../CustomButton";
import axiosInstance from "../../api/axiosInstance";
import UpdateModal from "./UpdateModal";
import StatusUpdateForm from "./Status_update";

function CaseTable() {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ pageSize: 6, current: 1 });
  const [doctorSelectedOption, setDoctorSelectedOption] = useState(null);
  const [doctorsData, setDoctorsData] = useState([]);
  const [allStatus, setAllStatus] = useState([]);

  const handleSelectChange = (value) => {
    setDoctorSelectedOption(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    handleSearch(searchTerm, value);
  };

  const handleSearch = async (value, doctor = doctorSelectedOption) => {
    setSearchTerm(value);
    setLoadingCases(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axiosInstance.get("/surgery_case/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: value,
          doctor_id: doctor,
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

      setFilteredData(dataWithKeys);
      setPagination((prev) => ({
        ...prev,
        total: response.data.totalRecords,
      }));
    } catch (error) {
      console.error("Error searching cases:", error);
      notification.error({
        message: "Error searching cases",
        description: error.message,
      });
    } finally {
      setLoadingCases(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setPagination({ ...pagination, current: 1 });
    handleSearch(value, doctorSelectedOption);
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
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingCases(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get("/surgery_case/", {
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
              key: item.surgery_case_id,
            }))
          : [];

        setFilteredData(dataWithKeys);
        setPagination({
          ...pagination,
          total: response.data.totalRecords,
        });
      } catch (error) {
        console.error("Error fetching cases:", error);
        notification.error({
          message: "Error fetching cases",
          description: error.message,
        });
      } finally {
        setLoadingCases(false);
      }
    };

    fetchData();
  }, [pagination.current, searchTerm]);

  useEffect(() => {
    setLoadingDoctors(true);
    const fetchDoctorsData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get("doctor/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response) {
          console.log("Respond : ", response);
        }

        if (response.data && Array.isArray(response.data.data)) {
          setDoctorsData(response.data.data);
        } else {
          console.error("Invalid data format received for doctors.");
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
        notification.error({
          message: "Error fetching cases",
          description: error.message,
        });
      } finally {
        setLoadingDoctors(false);
      }
    };

    const fetchTypeData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get("doctor/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response) {
          console.log("Respond : ", response);
        }

        if (response.data && Array.isArray(response.data.data)) {
          setDoctorsData(response.data.data);
        } else {
          console.error("Invalid data format received for doctors.");
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
        notification.error({
          message: "Error fetching cases",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorsData();
  }, []);

  useEffect(() => {
    const fetchStatusData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("patient/getAllStatus");
        if (response.status === 200 && response.data) {
          setAllStatus(response.data);
        }
      } catch (err) {
        notification.error({
          message: "Error Fetching Status Data",
          description: err.response
            ? `Server responded with status ${err.response.status}: ${
                err.response.data.message || "Unknown error"
              }`
            : "Unable to fetch status data. Please check your connection and try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
  }, []);

  const columns = [
    {
      title: <span className="text-base font-bold">#</span>,
      dataIndex: "surgery_case_id",
      key: "surgery_case_id",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">HN</span>,
      dataIndex: "hn_code",
      key: "hn_code",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">Patient Name</span>,
      dataIndex: "patientName",
      key: "patientName",
      render: (text, record) => (
        <span className="text-base font-normal">
          {record.patient_firstname} {record.patient_lastname}
        </span>
      ),
    },
    {
      title: <span className="text-base font-bold">Doctor</span>,
      dataIndex: "doctorName",
      key: "doctorName",
      render: (text, record) => (
        <span className="text-base font-normal">
          {record.doctor_firstname} {record.doctor_lastname}
        </span>
      ),
    },
    {
      title: <span className="text-base font-bold">Room</span>,
      dataIndex: "room_name",
      key: "room_name",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">Surgery Date</span>,
      dataIndex: "surgery_date",
      key: "surgery_date",
      render: (text) => (
        <span className="text-base font-normal">
          {new Date(text).toLocaleDateString()}{" "}
        </span>
      ),
    },
    {
      title: <span className="text-base font-bold">Update status</span>,
      dataIndex: "status_id",
      key: "status_id",
      render: (_, record) => (
        <StatusUpdateForm record={record} allStatus={allStatus} />
      ),
    },
    {
      title: <span className="text-base font-bold">Action</span>,
      key: "status",
      render: (_, record) => (
        <div className="flex items-center justify-between">
          <Tooltip title="View Status Timeline">
            <div>
              <CustomButton
                variant="primary"
                onClick={() => openStatusModal(record)}
                icon={<Icon icon="mdi:timeline-clock" className="h-5" />}
              >
                View
              </CustomButton>
            </div>
          </Tooltip>
          <Tooltip title="Setting Link">
            <div>
              <CustomButton
                variant="default"
                onClick={() => openLinkModal(record)}
                icon={<Icon icon="lucide:copy" />}
              >
                <span className="font-medium text-base">Setting</span>
              </CustomButton>
            </div>
          </Tooltip>
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
          placeholder="Search by case number, patient name..."
          className="w-1/4 h-10 text-base m-3"
          prefix={<Icon icon="mingcute:search-line" />}
          onChange={handleInputChange}
          value={searchTerm}
        />
        <Select
          className="w-1/4 h-10 m-3"
          placeholder="Filter By Doctor"
          value={doctorSelectedOption}
          onChange={handleSelectChange}
        >
          <Select.Option key="none" value="">
            None
          </Select.Option>
          {doctorsData.map((doctor) => (
            <Select.Option key={doctor.doctor_id} value={doctor.doctor_id}>
              {`${doctor.firstname} ${doctor.lastname}`}
            </Select.Option>
          ))}
        </Select>

        <CustomButton
          variant="white"
          icon={<Icon icon="mdi:reload" className="mr-2 w-4 h-4" />}
          onClick={() => {
            setSearchTerm("");
            setPagination({ ...pagination, current: 1 });
          }}
        >
          <span className="font-medium ml-2 text-lg">Reload Data</span>
        </CustomButton>
      </div>
      <div className="w-full h-full mt-4 overflow-x-auto">
        <Spin spinning={loadingCases} size="large">
          <Table
            dataSource={filteredData}
            columns={columns}
            loading={loadingCases}
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

export default CaseTable;
