import React, { useState, useEffect } from "react";
import { Table, Input, Tooltip, Button, notification, Select } from "antd";
import { Icon } from "@iconify/react";
import axiosInstance from "../../api/axiosInstance";
import UpdateModal from "./UpdateModal";
import StatusUpdateForm from "./Status_update";
import moment from "moment";
import { useNavigate } from "react-router-dom";

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
  const [dataLastestUpdated, setDataLastestUpdated] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const handleSelectChange = (value) => {
    setDoctorSelectedOption(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    handleSearch(searchTerm, value);
  };

  const handleEditRecord = (record) => {
    navigate(`/admin/case_manage/edit_case?id=${record.surgery_case_id}`);
  };

  const copyLink = (linkUrl) => {
    if (!linkUrl) {
      notification.warning({
        message: "No Link Available",
        description: "There is no link to copy. Please fetch the link first.",
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
        message: "Link Copied Successfully",
        description: "The link has been copied to your clipboard.",
      });
    } catch (err) {
      notification.error({
        message: "Copy Failed",
        description: "Unable to copy the link. Please copy manually.",
      });
      console.error("Copy Error:", err);
    } finally {
      document.body.removeChild(textArea);
    }
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
    fetchData();
  };

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
      setDataLastestUpdated(moment().format("HH:mm A"));
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

  useEffect(() => {
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

    // const fetchTypeData = async () => {
    //   try {
    //     const token = localStorage.getItem("jwtToken");
    //     const response = await axiosInstance.get("doctor/", {
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //       },
    //     });
    //     if (response) {
    //       console.log("Respond : ", response);
    //     }

    //     if (response.data && Array.isArray(response.data.data)) {
    //       setDoctorsData(response.data.data);
    //     } else {
    //       console.error("Invalid data format received for doctors.");
    //     }
    //   } catch (error) {
    //     console.error("Error fetching cases:", error);
    //     notification.error({
    //       message: "Error fetching cases",
    //       description: error.message,
    //     });
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    fetchDoctorsData();
  }, []);

  useEffect(() => {
    const fetchStatusData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("patient/getAllStatus");
        if (response.status === 200 && response.data) {
          console.log("response.data:", response.data);
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
      align: "center",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">HN</span>,
      dataIndex: "hn_code",
      key: "hn_code",
      align: "center",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">Patient Name</span>,
      dataIndex: "patientName",
      key: "patientName",
      align: "center",
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
      align: "center",
      render: (text, record) => (
        <span className="text-base font-normal">
          {record.doctor_prefix}
          {record.doctor_firstname} {record.doctor_lastname}
        </span>
      ),
    },
    {
      title: <span className="text-base font-bold">Room</span>,
      dataIndex: "room_name",
      key: "room_name",
      align: "center",
      render: (text) => <span className="text-base font-normal">{text}</span>,
    },
    {
      title: <span className="text-base font-bold">Surgery Date</span>,
      dataIndex: "surgery_date",
      key: "surgery_date",
      align: "center",
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
      align: "center",
      render: (_, record) => (
        <StatusUpdateForm record={record} allStatus={allStatus} />
      ),
    },
    {
      title: <span className="text-base font-bold">Status</span>,
      key: "status",
      align: "center",
      render: (_, record) => (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tooltip title="View Status Timeline">
            <div className="w-full sm:w-auto">
              <Button
                type="primary"
                icon={<Icon icon="mdi:eye" className="h-5" />}
                onClick={() => openStatusModal(record)}
                className="flex items-center gap-2"
              >
                View
              </Button>
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: <span className="text-base font-bold">Link</span>,
      dataIndex: "status_id",
      key: "status_id",
      align: "center",
      render: (_, record) => (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="default"
            icon={<Icon icon="lucide:settings" />}
            onClick={() => openLinkModal(record)}
            className="flex items-center gap-1"
          >
            Setting
          </Button>
          {record.active_link_id ? (
            <Button
              type="default"
              icon={<Icon icon="bx:bx-copy" />}
              onClick={() =>
                copyLink(`${BASE_URL}ptr?link=${record.active_link_id}`)
              }
              className="flex items-center gap-1"
              loading={copyLoading}
            >
              Copy
            </Button>
          ) : null}
        </div>
      ),
    },
    {
      title: <span className="text-base font-bold">Action</span>,
      key: "Action",
      align: "center",
      render: (_, record) => (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tooltip title="Edit Record">
            <div className="w-full sm:w-auto">
              <Button
                type="primary"
                icon={<Icon icon="lucide:edit" className="mr-2 w-4 h-4" />}
                onClick={() => handleEditRecord(record)}
                className="flex items-center gap-2"
              >
                <span className="font-medium text-base">Edit</span>
              </Button>
            </div>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col p-5 sm:p-7 w-full h-full gap-4">
      <div className="bg-gray-100 w-full rounded-lg flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 sm:gap-0 px-5 sm:px-10 py-4">
        <Input
          placeholder="Search by case number, patient name..."
          className="w-full sm:w-1/3 h-10 text-base"
          prefix={<Icon icon="mingcute:search-line" />}
          onChange={handleInputChange}
          value={searchTerm}
        />

        <Select
          className="w-full sm:w-1/4 h-10"
          placeholder="Filter By Doctor"
          value={doctorSelectedOption}
          onChange={handleSelectChange}
        >
          <Select.Option key="none" value="">
            None
          </Select.Option>
          {doctorsData.map((doctor) => (
            <Select.Option key={doctor.doctor_id} value={doctor.doctor_id}>
              {`${doctor.prefix}${doctor.firstname} ${doctor.lastname}`}
            </Select.Option>
          ))}
        </Select>

        <Button
          type="default"
          icon={<Icon icon="mdi:reload" className="mr-2 w-4 h-4" />}
          onClick={() => {
            setSearchTerm("");
            setPagination({ ...pagination, current: 1 });
            fetchData();
          }}
          className="w-full sm:w-auto"
        >
          <span className="font-medium ml-2 text-lg">Reload Data</span>
        </Button>
      </div>

      <div className="ml-auto text-right">
        <div className="text-gray-500 text-sm">
          Data Updated on: {dataLastestUpdated}
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
            showTotal: (total) => `Total ${total} items`,
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

export default CaseTable;
