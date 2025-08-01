import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Modal,
  Spin,
  notification,
  Popconfirm,
  message,
} from "antd";
import { Icon } from "@iconify/react";
import IMask from "imask";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import "./Form.css";

const { Option } = Select;

function EditCase() {
  const [form] = Form.useForm();
  const hnInputRef = React.useRef(null);
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [operatingRooms, setOperatingRooms] = useState([]);
  const [operatingRoomsLoading, setOperatingRoomsLoading] = useState(false);
  const [surgeryTypes, setSurgeryTypes] = useState([]);
  const [surgeryTypesLoading, setSurgeryTypesLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [surgery_case_id, setSurgery_case_id] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [set_id, setSet_id] = useState(null);
  const [searchIsLoading, setSearchIsLoading] = useState(false);
  const [patientDobData, setPatientDobData] = useState({});
  const yearRef = useRef(null);
  const monthRef = useRef(null);
  const dayRef = useRef(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");
    setSurgery_case_id(id);
  }, [location]);

  const [surgeryData, setSurgeryData] = useState({
    surgery_start_time: null,
    surgery_end_time: null,
  });
  const [patientData, setPatientData] = useState({
    hn_code: "",
    firstname: "",
    lastname: "",
    gender: "",
    dob: "",
  });
  // useEffect(() => {
  //   console.log("Fetched surgeryData:", surgeryData);
  // }, [surgeryData]);

  useEffect(() => {
    setIsLoading(true);

    const fetchSurgeryData = async () => {
      try {
        const response = await axiosInstanceStaff.get(
          `/surgery_case/patient/${surgery_case_id}`
        );

        const surgeryCase = response.data?.data;

        if (!surgeryCase) {
          throw new Error("No surgery case data found");
        }
        // console.log("surgeryCase", surgeryCase);

        const transformedSurgeryData = {
          patient_id: surgeryCase.patient_id,
          surgery_case_id: surgeryCase.surgery_case_id || null,
          surgery_start_time:
            surgeryCase.surgery_start_time &&
              dayjs(surgeryCase.surgery_start_time).isValid()
              ? dayjs(surgeryCase.surgery_start_time)
              : null,
          surgery_end_time:
            surgeryCase.surgery_end_time &&
              dayjs(surgeryCase.surgery_end_time).isValid()
              ? dayjs(surgeryCase.surgery_end_time)
              : null,

          surgery_type_id: surgeryCase.surgery_type_id || null,
          operating_room_id: surgeryCase.operating_room_id || null,
          status_id: surgeryCase.status_id || null,
          operation_id: surgeryCase.operation_id || null,
          operation_name: surgeryCase.operation_name || null,
          doctor_id: surgeryCase.doctor_id || null,
          note: surgeryCase.note || "",
          isActive: surgeryCase.isactive || false,
        };

        const transformedPatientData = {
          hn_code: surgeryCase.patient_hn_code || "",
          firstname: surgeryCase.patient_firstname || "",
          lastname: surgeryCase.patient_lastname || "",
          gender: surgeryCase.patient_gender || "",
          dob: surgeryCase.patient_dob || "",
        };

        // console.log("Transformed surgeryData:", transformedSurgeryData);
        // console.log("Transformed patientData:", transformedPatientData);
        const dobDate = dayjs(surgeryCase.patient_dob);
        const dob_year = dobDate.year();
        const dob_month = String(dobDate.month() + 1).padStart(2, "0");
        const dob_day = String(dobDate.date()).padStart(2, "0");

        const combinedData = {
          ...transformedSurgeryData,
          ...transformedPatientData,
        };

        setPatientDobData({
          patient_dob_year: dob_year,
          patient_dob_month: dob_month,
          patient_dob_day: dob_day,
        });
        form.setFieldsValue({
          patient_dob_year: dob_year,
          patient_dob_month: dob_month,
          patient_dob_day: dob_day,
        });
        form.setFieldsValue(combinedData);
        // console.log("transformedSurgeryData", transformedSurgeryData);

        setSurgeryData(transformedSurgeryData);
        setPatientData(transformedPatientData);
        setSet_id(transformedSurgeryData.surgery_case_id || "");
      } catch (error) {
        console.error(
          "Error fetching surgery case data:",
          error.message || error
        );
      }
    };

    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);
        const response = await axiosInstanceStaff.get("/doctor/");

        if (response.status === 200) {
          // console.log("response.data.data", response.data.data);
          setDoctors(response.data.data);
        } else {
          throw new Error(`Failed to fetch doctors: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        notification.error({
          message: "ไม่สามารถโหลดข้อมูลแพทย์ได้ กรุณาลองใหม่อีกครั้ง",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      } finally {
        setDoctorsLoading(false);
      }
    };

    const fetchOperatingRooms = async () => {
      try {
        const response = await axiosInstanceStaff.get("/or_room/");

        if (response.status === 200) {
          setOperatingRooms(response.data.data);
        } else {
          throw new Error(
            `Failed to fetch operating rooms: ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Error fetching operating rooms:", error);
        notification.error({
          message: "ไม่สามารถโหลดข้อมูลห้องผ่าตัดได้ กรุณาลองใหม่อีกครั้ง",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      }
    };

    const fetchAllSurgeryTypes = async () => {
      try {
        const response = await axiosInstanceStaff.get(
          "/surgery_case/all_surgery_types"
        );

        if (response.status === 200) {
          setSurgeryTypes(response.data.data);
        } else {
          throw new Error(
            `Failed to fetch surgery types: ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Error fetching surgery types:", error);

        notification.error({
          message: "ไม่สามารถโหลดข้อมูลประเภทการผ่าตัดได้ กรุณาลองใหม่อีกครั้ง",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      }
    };

    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchSurgeryData(),
          fetchDoctors(),
          fetchOperatingRooms(),
          fetchAllSurgeryTypes(),
        ]);
      } catch (error) {
        console.error("Error fetching all data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (surgery_case_id) {
      fetchAllData();
    }
  }, [surgery_case_id, user.id]);

  const updateEndtime = (startTime) => {
    if (!startTime) return;

    const currentEndTime = surgeryData.surgery_end_time
      ? dayjs(surgeryData.surgery_end_time)
      : null;

    if (!currentEndTime || dayjs(startTime).isAfter(currentEndTime)) {
      const newEndTime = dayjs(startTime).add(5, "minute");

      if (newEndTime.isValid()) {
        setSurgeryData((prev) => ({
          ...prev,
          surgery_end_time: newEndTime.format("YYYY-MM-DD HH:mm"),
        }));

        form.setFieldsValue({
          surgery_end_time: newEndTime,
        });
      } else {
        console.error("Invalid date");
      }
    }
  };

  const handleSurgeryDataChange = (name, value) => {
    setSurgeryData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "surgery_start_time") {
      updateEndtime(value);
    }
  };

  const handlePatientDataChange = (key, value) => {
    if (key === "hn_code") {
      let newValue = value.replace(/\D/g, "");
      if (newValue.length > 10) newValue = newValue.slice(0, 10);

      if (newValue.length > 2)
        newValue = newValue.slice(0, 2) + "-" + newValue.slice(2);
      if (newValue.length > 5)
        newValue = newValue.slice(0, 5) + "-" + newValue.slice(5);

      setPatientData((prevData) => ({
        ...prevData,
        hn_code: newValue,
      }));
    } else {
      setPatientData((prevData) => ({
        ...prevData,
        [key]: value,
      }));
    }
  };

  // useEffect(() => {
  //   console.log("patientData", patientData);
  // }, [patientData]);

  const onFinish = async () => {
    // console.log("patientData", patientData);
    // console.log("patientData DOB", dayjs(patientData.dob));
    // console.log("dayjs", dayjs());

    try {
      const patientDataToSend = {
        hn_code: patientData.hn_code,
        firstname: patientData.firstname,
        lastname: patientData.lastname,
        gender: patientData.gender,
        dob: patientData.dob,
      };
      if (dayjs(patientData.dob).isAfter(dayjs(), "day")) {
        message.error("วันเกิดคนไข้ ห้ามเกินวันที่ปัจจุบัน");
        return;
      }

      const isValidDate = (dateString) => {
        // console.log("dateString ก่อนแปลง", dateString);
        const formattedDate = dayjs(dateString).format("YYYY-MM-DD");
        // console.log("formattedDate", formattedDate);

        return dayjs(formattedDate, "YYYY-MM-DD", true).isValid();
      };

      if (!isValidDate(patientData.dob)) {
        message.error("กรุณากรอกข้อมูลวันเกิดให้ถูกต้อง");
        return;
      }

      let patientId;
      const existingPatientResponse = await axiosInstanceStaff.get(
        `/patient/getPatientData/${patientData.hn_code}`
      );
      const existingPatient = existingPatientResponse.data?.data;

      if (existingPatient) {
        const patientResponse = await axiosInstanceStaff.put(
          `/patient/${existingPatient.patient_id}`,
          patientDataToSend
        );
        // console.log("Patient Response (Update):", patientResponse.data);
        patientId = existingPatient.patient_id;
      } else {
        const patientResponse = await axiosInstanceStaff.post(
          `/patient`,
          patientDataToSend
        );
        // console.log("Patient Response (Create):", patientResponse.data);
        patientId = patientResponse.data?.patient?.id;
      }

      if (!patientId) {
        throw new Error("Patient ID is missing. Unable to proceed.");
      }


      const surgeryCaseDataToSend = {
        surgery_type_id: surgeryData.surgery_type_id,
        doctor_id: surgeryData.doctor_id,
        surgery_start_time: surgeryData.surgery_start_time,
        surgery_end_time: surgeryData.surgery_end_time,
        operating_room_id: surgeryData.operating_room_id,
        note: surgeryData.note || "",
        patient_id: patientId,
      };

      const surgeryCaseResponse = await axiosInstanceStaff.put(
        `/surgery_case/${surgery_case_id}`,
        surgeryCaseDataToSend
      );
      // console.log("Surgery Case Response:", surgeryCaseResponse.data);

      if (surgeryCaseResponse.status === 200) {
        const OperationDataToSend = {
          operation_name: surgeryData.operation_name,
          surgery_case_id: surgery_case_id,
        };

        // console.log("Operation Data to Send:", OperationDataToSend);

        const operationResponse = await axiosInstanceStaff.post(
          `/surgery_case/operation/`,
          OperationDataToSend
        );
        // console.log("Operation Response:", operationResponse.data);

        if (
          operationResponse.status === 200 ||
          operationResponse.status === 201
        ) {
          navigate("/admin/case_manage");
          notification.success({
            message: "อัปเดตข้อมูลเคสผ่าตัดเรียบร้อย",
            showProgress: true,
            placement: "topRight",
            pauseOnHover: true,
            duration: 2,
          });
        } else {
          notification.error({
            message: "ไม่สามารถเพิ่มข้อมูลการผ่าตัดได้ กรุณาลองใหม่อีกครั้ง",
            showProgress: true,
            placement: "topRight",
            pauseOnHover: true,
            duration: 2,
          });
        }
      } else {
        notification.error({
          message:
            "ไม่สามารถอัปเดตรายละเอียดของเคสผ่าตัดได้ กรุณาลองใหม่อีกครั้ง",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดระหว่างการทำงาน:", error);
      if (error.response?.status === 409) {
        notification.warning({
          message: "ช่วงเวลานี้มีการจองห้องผ่าตัดนี้แล้ว",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 5,
        });
      } else {
        notification.error({
          message: "เกิดข้อผิดพลาดระหว่างดำเนินการ กรุณาลองใหม่ภายหลัง ",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      }
    }
  };

  const handlePatientDobChange = (field, value, event) => {
    setPatientDobData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    form.setFieldsValue({
      [field]: value,
    });

    if (field === "patient_dob_year" && value.length === 4) {
      monthRef.current?.focus();
    }

    if (
      field === "patient_dob_month" &&
      (value.length === 2 || (value >= 3 && value <= 9))
    ) {
      dayRef.current?.focus();
    }

    if (
      field === "patient_dob_day" &&
      (value.length === 2 || (value >= 3 && value <= 9))
    ) {
      updateDobInPatientData();
    }
    // console.log("value", value);
    // console.log("event?.key", event?.nativeEvent);
  };

  useEffect(() => {
    updateDobInPatientData();
  }, [patientDobData]);

  const updateDobInPatientData = () => {
    const formattedDob = getFormattedDob();

    if (formattedDob) {
      setPatientData((prevData) => ({
        ...prevData,
        dob: formattedDob,
      }));
      // console.log("formattedDob:", formattedDob);
    }
  };

  useEffect(() => {
    console.log("Updated patientData:", patientData);
  }, [patientData]);

  const getFormattedDob = () => {
    const { patient_dob_year, patient_dob_month, patient_dob_day } =
      patientDobData;

    if (
      patient_dob_year &&
      patient_dob_month &&
      patient_dob_day &&
      patient_dob_month >= 1 &&
      patient_dob_month <= 12 &&
      patient_dob_day >= 1 &&
      patient_dob_day <= 31
    ) {
      return `${String(patient_dob_year).padStart(4, "0")}-${String(
        patient_dob_month
      ).padStart(2, "0")}-${String(patient_dob_day).padStart(2, "0")}`;
    }
    return "";
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axiosInstanceStaff.patch(
        `/surgery_case/isActive/${surgery_case_id}`,
        {
          isActive: surgeryData.isActive === true ? false : true,
        }
      );

      if (response.status === 200) {
        navigate("/admin/case_manage");
        notification.success({
          message: "สถานะเคสผ่าตัดถูกอัปเดตแล้ว",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
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

  const handleSaveConfirm = () => {
    Modal.confirm({
      title: "ยืนยันการบันทึก",
      content: "คุณแน่ใจไหมว่าต้องการบันทึกข้อมูลเคสการผ่าตัดที่แก้ไขแล้ว?",
      okText: "ใช่, บันทึก",
      cancelText: "ยกเลิก",
      centered: true,
      onOk: onFinish,
    });
  };

  useEffect(() => {
    if (hnInputRef.current) {
      const maskOptions = {
        mask: "00-00-000000",
      };
      const mask = IMask(hnInputRef.current.input, maskOptions);

      mask.on("accept", () => {
        setPatientData((prev) => ({
          ...prev,
          hn_code: mask.value,
        }));
      });

      return () => mask.destroy();
    }
  }, []);

  const handleSeachHNClick = async () => {
    const hnCode = patientData.hn_code.trim();

    if (!hnCode) {
      notification.warning({
        message: "กรุณากรอกรหัส HN ก่อนค้นหา",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
      return;
    }

    setSearchIsLoading(true);

    try {
      const response = await axiosInstanceStaff.get(
        `/patient/getPatientData/${hnCode}`
      );

      if (response.data.success) {
        const patientInfo = response.data.data;
        const updatedPatientData = {
          ...patientData,
          hn_code: patientInfo.hn_code || hnCode,
          firstname: patientInfo.firstname || "",
          lastname: patientInfo.lastname || "",
          gender: patientInfo.gender || null,
          dob: patientInfo.dob || "",
        };
        const dobDate = dayjs(patientInfo.dob);
        const dob_year = dobDate.year();
        const dob_month = String(dobDate.month() + 1).padStart(2, "0");
        const dob_day = String(dobDate.date()).padStart(2, "0");

        setPatientData(updatedPatientData);
        form.setFieldsValue({
          patient_dob_year: dob_year,
          patient_dob_month: dob_month,
          patient_dob_day: dob_day,
        });
        form.setFieldsValue(updatedPatientData);
      } else {
        notification.error({
          message: "ไม่พบข้อมูลผู้ป่วยในระบบ",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      }
    } catch (error) {
      console.error(
        "Error fetching patient data:",
        error.response?.data || error.message
      );

      const updatedPatientData = {
        ...patientData,
        firstname: "",
        lastname: "",
        gender: null,
        dob: null,
      };

      setPatientData(updatedPatientData);

      form.setFieldsValue({
        firstname: "",
        lastname: "",
        gender: null,
        patient_dob_year: null,
        patient_dob_month: null,
        patient_dob_day: null,
      });

      notification.error({
        message: "ไม่พบข้อมูลผู้ป่วยในระบบ",
        showProgress: true,
        placement: "topRight",
        pauseOnHover: true,
        duration: 2,
      });
    } finally {
      setSearchIsLoading(false);
    }
  };

  return (
    surgeryData &&
    patientData && (
      <div>
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-normal flex flex-row pb-5">
              <p className="text-black">แก้ไขเคสผ่าตัด</p>
              <p className="text-blue-600 ml-2">#{set_id}</p>
            </div>
            <hr />
            <div className="p-6 rounded-base min-h-full">
              <div className="w-3/4 mx-auto">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveConfirm}
                  className="space-y-8"
                  initialValues={surgeryData}
                >
                  {/* Personal Information Section */}
                  <section className="bg-white">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-2 h-8 bg-green-600 rounded-full" />
                      <h2 className="text-xl font-semibold text-gray-800">
                        ข้อมูลผู้ป่วย
                      </h2>
                    </div>
                    <Form.Item
                      label={
                        <span className="text-base font-medium text-gray-700">
                          หมายเลขของผู้ป่วย{" "}
                        </span>
                      }
                      name="hn_code"
                      rules={[
                        {
                          required: true,
                          message: "กรุณากรอกหมายเลขของผู้ป่วย !",
                        },
                      ]}
                    >
                      <div className="flex space-x-2 max-w-md">
                        <Input
                          placeholder="Enter HN Code"
                          name="hn_code"
                          value={patientData.hn_code}
                          onChange={(event) =>
                            handlePatientDataChange(
                              "hn_code",
                              event.target.value.trim()
                            )
                          }
                          ref={hnInputRef}
                          className="h-11 text-base border rounded-lg"
                        />
                        <Button
                          loading={searchIsLoading}
                          onClick={handleSeachHNClick}
                          className="h-11 w-1/4 flex items-center justify-center gap-2"
                          type="primary"
                        >
                          <Icon icon="mdi:magnify" className="text-lg" />
                          ค้นหา
                        </Button>
                      </div>
                    </Form.Item>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            ชื่อ
                          </span>
                        }
                        name="firstname"
                        rules={[
                          {
                            required: true,
                            message: "กรุณากรอกชื่อของผู้ป่วย!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter First Name"
                          name="firstname"
                          value={patientData.firstname}
                          onChange={(event) =>
                            handlePatientDataChange(
                              "firstname",
                              event.target.value.trim()
                            )
                          }
                          onBlur={(event) =>
                            handlePatientDataChange(
                              "firstname",
                              event.target.value.trim()
                            )
                          }
                          className="h-11 text-base rounded-lg"
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            นามสกุล
                          </span>
                        }
                        name="lastname"
                        rules={[
                          {
                            required: true,
                            message: "กรุณากรอกนามสกุลของผู้ป่วย!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter Last Name"
                          name="lastname"
                          value={patientData.lastname}
                          onChange={(e) =>
                            handlePatientDataChange(
                              "lastname",
                              e.target.value.trim()
                            )
                          }
                          onBlur={(e) =>
                            handlePatientDataChange(
                              "lastname",
                              e.target.value.trim()
                            )
                          }
                          className="h-11 text-base rounded-lg"
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            เพศ
                          </span>
                        }
                        name="gender"
                        rules={[
                          {
                            required: true,
                            message: "กรุณาเลือกเพศของผู้ป่วย !",
                          },
                        ]}
                      >
                        <Select
                          value={patientData.gender}
                          onChange={(e) =>
                            handlePatientDataChange("gender", e.target.value)
                          }
                          className="h-11 text-base"
                          placeholder="Select gender"
                        >
                          <Option value="1">ชาย</Option>
                          <Option value="2">หญิง</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            ปี/เดือน/วัน เกิด{" "}
                          </span>
                        }
                        required
                        rules={[
                          {
                            required: true,
                            message: "กรุณาระบุปี/เดือน/วันเกิด",
                          },
                        ]}
                      >
                        <Input.Group className="flex">
                          <Form.Item
                            inputMode="numeric"
                            name="patient_dob_year"
                            noStyle
                            rules={[
                              {
                                required: true,
                                message: "จำเป็นต้องกรอกปี",
                              },
                              {
                                pattern: /^\d{4}$/,
                                message: "รูปแบบปีไม่ถูกต้อง",
                              },
                              {
                                validator: (_, value) => {
                                  const currentYear = new Date().getFullYear();
                                  if (
                                    value &&
                                    (value < 1900 || value > currentYear)
                                  ) {
                                    return Promise.reject(
                                      "ปีไม่ถูกต้อง กรุณากรอกปีที่เหมาะสม"
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              ref={yearRef}
                              value={patientData.patient_dob_year}
                              onChange={(e) =>
                                handlePatientDobChange(
                                  "patient_dob_year",
                                  e.target.value.replace(/\D/g, ""),
                                  e
                                )
                              }
                              placeholder="YYYY"
                              className="h-11 text-base rounded-lg w-24 text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              maxLength={4}
                            />
                          </Form.Item>

                          <Form.Item
                            name="patient_dob_month"
                            noStyle
                            rules={[
                              {
                                required: true,
                                message: "จำเป็นต้องกรอกเดือน",
                              },
                              {
                                pattern: /^(0[1-9]|1[0-2])$/,
                                message:
                                  "กรุณากรอกเดือนในรูปแบบที่ถูกต้อง (01-12)",
                              },
                              {
                                validator: (_, value) => {
                                  if (value < 1 || value > 12) {
                                    return Promise.reject(
                                      "กรุณากรอกเดือนที่อยู่ในช่วง 1-12"
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              ref={monthRef}
                              value={patientData.patient_dob_month}
                              onChange={(e) =>
                                handlePatientDobChange(
                                  "patient_dob_month",
                                  e.target.value.replace(/\D/g, ""),
                                  e
                                )
                              }
                              placeholder="MM"
                              className="h-11 text-base rounded-lg w-20 text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              maxLength={2}
                              onBlur={(e) => {
                                let value = e.target.value.replace(/\s+/g, "");
                                let numValue = parseInt(value);
                                if (numValue < 10 && value.length === 1) {
                                  value = `0${value}`;
                                }
                                if (numValue >= 13) {
                                  value = "12";
                                }
                                handlePatientDobChange(
                                  "patient_dob_month",
                                  value.replace(/\D/g, "")
                                );
                              }}
                            />
                          </Form.Item>

                          <Form.Item
                            name="patient_dob_day"
                            noStyle
                            rules={[
                              {
                                required: true,
                                message: "จำเป็นต้องกรอกวัน",
                              },
                              {
                                pattern: /^(0[1-9]|[12][0-9]|3[01])$/,
                                message:
                                  "กรุณากรอกวันในรูปแบบที่ถูกต้อง (01-31)",
                              },
                            ]}
                          >
                            <Input
                              ref={dayRef}
                              value={patientData.patient_dob_day}
                              onChange={(e) =>
                                handlePatientDobChange(
                                  "patient_dob_day",
                                  e.target.value.replace(/\D/g, ""),
                                  e
                                )
                              }
                              placeholder="DD"
                              className="h-11 text-base rounded-lg w-20 text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              maxLength={2}
                              onBlur={(e) => {
                                let value = e.target.value.replace(/\s+/g, "");
                                let numValue = parseInt(value);
                                if (numValue < 10 && value.length === 1) {
                                  value = `0${value}`;
                                }
                                if (numValue >= 32) {
                                  value = "31";
                                }
                                handlePatientDobChange(
                                  "patient_dob_day",
                                  value
                                );
                              }}
                            />
                          </Form.Item>
                        </Input.Group>
                      </Form.Item>
                    </div>
                  </section>

                  {/* Surgery Details Section */}
                  <section className="bg-white">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-2 h-8 bg-purple-600 rounded-full" />
                      <h2 className="text-xl font-semibold text-gray-800">
                        รายละเอียดการผ่าตัด
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            แพทย์
                          </span>
                        }
                        name="doctor_id"
                        rules={[
                          {
                            required: true,
                            message: "Please select a doctor!",
                          },
                        ]}
                      >
                        <Select
                          value={surgeryData.doctor_id}
                          onChange={(value) =>
                            handleSurgeryDataChange("doctor_id", value)
                          }
                          className="h-11 text-base"
                          loading={doctorsLoading}
                          placeholder="Select a doctor"
                        >
                          {doctors
                            .sort((a, b) =>
                              a.firstname.localeCompare(b.firstname, "th", {
                                sensitivity: "base",
                              })
                            )
                            .map((doctor) => (
                              <Option
                                key={doctor.doctor_id}
                                value={doctor.doctor_id}
                              >
                                {doctor.prefix}
                                {doctor.firstname} {doctor.lastname}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            การผ่าตัด
                          </span>
                        }
                        name="operation_name"
                        rules={[
                          {
                            required: true,
                            message: "Please enter the Operation!",
                          },
                        ]}
                      >
                        <Input
                          name="operation_name"
                          value={surgeryData.operation_name}
                          onChange={(e) =>
                            handleSurgeryDataChange(
                              "operation_name",
                              e.target.value
                            )
                          }
                          className="h-11 text-base rounded-lg"
                          placeholder="Enter Operation"
                        />
                      </Form.Item>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            ประเภทการผ่าตัด
                          </span>
                        }
                        name="surgery_type_id"
                        rules={[
                          {
                            required: true,
                            message: "Please select surgery type!",
                          },
                        ]}
                        className="w-full"
                      >
                        <Select
                          value={surgeryData.surgery_type_id}
                          onChange={(value) =>
                            handleSurgeryDataChange("surgery_type_id", value)
                          }
                          className="h-10 w-full text-base font-normal"
                          placeholder="Select a surgery type"
                          loading={surgeryTypesLoading}
                          optionLabelProp="label"
                        >
                          {(surgeryTypes ?? [])
                            .filter((type) => type.surgery_type_name)
                            .map((type) => (
                              <Option
                                key={type.surgery_type_id}
                                value={type.surgery_type_id}
                                label={type.surgery_type_name}
                              >
                                <div>
                                  <span className="font-medium">
                                    {type.surgery_type_name}
                                  </span>
                                  <br />
                                  <span className="text-gray-500 text-sm">
                                    {type.description}
                                  </span>
                                </div>
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            ห้องผ่าตัด
                          </span>
                        }
                        name="operating_room_id"
                        rules={[
                          {
                            required: true,
                            message: "Please select OR-Room!",
                          },
                        ]}
                        className="w-full"
                      >
                        <Select
                          value={surgeryData.operating_room_id}
                          onChange={(value) =>
                            handleSurgeryDataChange("operating_room_id", value)
                          }
                          className="h-10 w-full text-base font-normal"
                          loading={operatingRoomsLoading}
                          placeholder="Select an OR-Room"
                        >
                          {[
                            ...operatingRooms
                              .filter((room) => room.room_name !== "-")
                              .sort((a, b) => {
                                const numA =
                                  parseInt(
                                    a.room_name.replace(/\D/g, ""),
                                    10
                                  ) || 0;
                                const numB =
                                  parseInt(
                                    b.room_name.replace(/\D/g, ""),
                                    10
                                  ) || 0;
                                return numA - numB;
                              }),
                            ...operatingRooms.filter(
                              (room) => room.room_name === "-"
                            ),
                          ].map((room) => (
                            <Option
                              key={room.operating_room_id}
                              value={room.operating_room_id}
                            >
                              {room.room_name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            เวลาเริ่มผ่าตัด
                          </span>
                        }
                        name="surgery_start_time"
                        rules={[
                          { required: true, message: "Please pick a date!" },
                        ]}
                      >
                        <DatePicker
                          needConfirm={false}
                          showTime={{
                            format: "HH:mm",
                          }}
                          format="YYYY-MM-DD HH:mm"
                          value={
                            surgeryData.surgery_start_time
                              ? dayjs(surgeryData.surgery_start_time)
                                .format("YYYY-MM-DD HH:mm")
                              : null
                          }
                          onChange={(date) =>
                            handleSurgeryDataChange(
                              "surgery_start_time",
                              date ? date : null
                            )
                          }
                          className="h-11 text-base rounded-lg w-full"
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            เวลาสิ้นสุดผ่าตัด
                          </span>
                        }
                        name="surgery_end_time"
                        rules={[
                          { required: true, message: "Please pick a time!" },
                        ]}
                      >
                        <DatePicker
                          needConfirm={false}
                          showTime={{ format: "HH:mm" }}
                          format="YYYY-MM-DD HH:mm"
                          value={
                            surgeryData.surgery_end_time
                              ? dayjs(surgeryData.surgery_end_time)
                                .format("YYYY-MM-DD HH:mm")
                              : null
                          }
                          onChange={(date) =>
                            handleSurgeryDataChange(
                              "surgery_end_time",
                              date ? date : null
                            )
                          }
                          disabledDate={(current) => {
                            const startTime = surgeryData.surgery_start_time
                              ? dayjs(
                                surgeryData.surgery_start_time,
                                "YYYY/MM/DD HH:mm"
                              ).tz("Asia/Bangkok")
                              : null;
                            return (
                              startTime && current < startTime.startOf("day")
                            );
                          }}
                          disabledTime={(current) => {
                            const startTime = surgeryData.surgery_start_time
                              ? dayjs(
                                surgeryData.surgery_start_time,
                                "YYYY/MM/DD HH:mm"
                              ).tz("Asia/Bangkok")
                              : null;

                            if (!startTime || !current) return {};

                            if (current.isSame(startTime, "day")) {
                              return {
                                disabledHours: () =>
                                  Array.from(
                                    { length: startTime.hour() },
                                    (_, i) => i
                                  ),
                                disabledMinutes: (hour) =>
                                  hour === startTime.hour()
                                    ? Array.from(
                                      { length: startTime.minute() + 5 },
                                      (_, i) => i
                                    )
                                    : [],
                              };
                            }

                            return {};
                          }}
                          className="h-11 text-base rounded-lg w-full"
                        />
                      </Form.Item>
                    </div>
                    <Form.Item
                      label={
                        <span className="text-base font-medium text-gray-700">
                          Note
                          <span className="text-sm font-normal text-gray-500">
                            {" "}
                            (ไม่จำเป็น){" "}
                          </span>
                        </span>
                      }
                      name="note"
                      className="mt-4"
                    >
                      <Input.TextArea
                        name="note"
                        value={surgeryData.note}
                        onChange={(e) =>
                          handleSurgeryDataChange("note", e.target.value.trim())
                        }
                        rows={4}
                        className="text-base rounded-lg"
                        placeholder="Enter patient's medical history..."
                      />
                    </Form.Item>

                    {/* <Form.Item
                      label={
                        <span className="text-base font-medium text-gray-700">
                          ประวัติผู้ป่วย
                          <span className="text-sm font-normal text-gray-500">
                            {" "}
                            ( ไม่จำเป็น ){" "}
                          </span>
                        </span>
                      }
                      name="patient_history"
                      className="mt-4"
                    >
                      <Input.TextArea
                        name="patient_history"
                        value={surgeryData.patient_history}
                        onChange={(e) =>
                          handleSurgeryDataChange(
                            "patient_history",
                            e.target.value
                          )
                        }
                        rows={4}
                        className="text-base rounded-lg"
                        placeholder="Enter patient's medical history..."
                      />
                    </Form.Item> */}
                  </section>

                  {/* Bottom Action Buttons */}
                  <div className="flex justify-center space-x-4 pt-6 border-t w-full">
                    <Popconfirm
                      title="ยืนยันการลบเคสผ่าตัด"
                      okText="ยืนยัน"
                      cancelText="ยกเลิก"
                      onConfirm={handleDeleteConfirm}
                    >
                      <Button
                        type="danger"
                        className="text-lg h-11 px-8 bg-red-600 hover:bg-red-500 flex text-white items-center justify-center w-1/3"
                      >
                        {surgeryData.isActive === true ? "ลบ" : "กู้คืน"}
                        <Icon
                          icon={
                            surgeryData.isActive === true
                              ? "solar:trash-bin-trash-bold"
                              : "grommet-icons:revert"
                          }
                          className="ml-2"
                        />
                      </Button>
                    </Popconfirm>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="text-lg h-11 px-8 bg-blue-600 hover:bg-blue-700 flex items-center justify-center w-2/3"
                    >
                      บันทึก
                      <Icon icon="mdi:check-circle" className="ml-2" />
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </>
        )}
      </div>
    )
  );
}

export default EditCase;
