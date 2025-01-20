import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Modal,
  Spin,
  TimePicker,
  notification,
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
  const hnInputRef = useRef(null);
  const dobInputRef = useRef(null);
  const hnMaskRef = useRef(null);
  const dobMaskRef = useRef(null);
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
  const [hn, setHN] = useState(null);
  const [searchIsLoading, setSearchIsLoading] = useState(false);
  const [patientDobData, setPatientDobData] = useState({});

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");
    setSurgery_case_id(id);
  }, [location]);

  const [surgeryData, setSurgeryData] = useState(null);

  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    console.log("Fetched surgeryData:", surgeryData);
  }, [surgeryData]);

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
        console.log("surgeryCase", surgeryCase);

        const transformedSurgeryData = {
          patient_id: surgeryCase.patient_id,
          surgery_case_id: surgeryCase.surgery_case_id || null,
          surgery_date:
            surgeryCase.surgery_date &&
            dayjs(surgeryCase.surgery_date).isValid()
              ? dayjs(surgeryCase.surgery_date)
              : null,
          estimate_start_time:
            surgeryCase.estimate_start_time &&
            dayjs(surgeryCase.estimate_start_time, "HH:mm").isValid()
              ? dayjs(surgeryCase.estimate_start_time, "HH:mm")
              : null,
          estimate_duration: surgeryCase.estimate_duration || null,
          surgery_type_id: surgeryCase.surgery_type_id || null,
          operating_room_id: surgeryCase.operating_room_id || null,
          status_id: surgeryCase.status_id || null,
          operation_id: surgeryCase.operation_id || null,
          operation_name: surgeryCase.operation_name || null,
          doctor_id: surgeryCase.doctor_id || null,
        };

        const transformedPatientData = {
          patient_hn_code: surgeryCase.patient_hn_code || "",
          patient_firstname: surgeryCase.patient_firstname || "",
          patient_lastname: surgeryCase.patient_lastname || "",
          patient_gender: surgeryCase.patient_gender || "",
          patient_dob_year: "",
          patient_dob_month: "",
          patient_dob_day: "",
        };

        if (
          surgeryCase.patient_dob &&
          dayjs(surgeryCase.patient_dob).isValid()
        ) {
          const formattedDob = dayjs(surgeryCase.patient_dob);

          transformedPatientData.patient_dob_year = formattedDob.format("YYYY");
          transformedPatientData.patient_dob_month = formattedDob.format("MM");
          transformedPatientData.patient_dob_day = formattedDob.format("DD");
        }

        console.log("Transformed surgeryData:", transformedSurgeryData);
        console.log("Transformed patientData:", transformedPatientData);

        const combinedData = {
          ...transformedSurgeryData,
          ...transformedPatientData,
        };
        form.setFieldsValue(combinedData);

        setSurgeryData(transformedSurgeryData);
        setPatientData(transformedPatientData);

        setHN(transformedPatientData.patient_hn_code || "");
      } catch (error) {
        console.error(
          "Error fetching surgery case data:",
          error.message || error
        );
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await axiosInstanceStaff.get("/doctor/");

        if (response.status === 200) {
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

  const handleSurgeryDataChange = (name, value) => {
    setSurgeryData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePatientDataChange = (key, value) => {
    setPatientData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const onFinish = async () => {
    try {
      const patientDataToSend = {
        hn_code: patientData.patient_hn_code,
        dob: dayjs(patientData.patient_dob).format("YYYY-MM-DD"),
        firstname: patientData.patient_firstname,
        lastname: patientData.patient_lastname,
        gender: patientData.patient_gender,
      };
      console.log("Patient Data to Send:", patientDataToSend);

      const surgeryCaseDataToSend = {
        surgery_type_id: surgeryData.surgery_type_id,
        doctor_id: surgeryData.doctor_id,
        surgery_date: dayjs(surgeryData.surgery_date).format("YYYY-MM-DD"),
        estimate_start_time: dayjs(
          surgeryData.estimate_start_time,
          "HH:mm"
        ).format("HH:mm"),
        estimate_duration: surgeryData.estimate_duration,
        operating_room_id: surgeryData.operating_room_id,
        patient_history: surgeryData.patient_history || "",
      };

      const OperationDataToSend = {
        operation_name: surgeryData.operation_name,
        surgery_case_id: surgery_case_id,
      };
      console.log("Surgery Case Data to Send:", surgeryCaseDataToSend);
      console.log("Patient Case Data to Send:", patientDataToSend);
      console.log("Operation Data to Send:", OperationDataToSend);

      const surgeryCaseResponse = await axiosInstanceStaff.put(
        `/surgery_case/${surgery_case_id}`,
        surgeryCaseDataToSend
      );
      console.log("Surgery Case Response:", surgeryCaseResponse.data);

      if (surgeryCaseResponse.status === 200) {
        const patientResponse = await axiosInstanceStaff.put(
          `/patient/${surgeryData.patient_id}`,
          patientDataToSend
        );
        console.log("Patient Response:", patientResponse.data);

        if (patientResponse.status === 200) {
          // Add Operation Data
          const operationResponse = await axiosInstanceStaff.post(
            `/surgery_case/operation/`,
            OperationDataToSend
          );
          console.log("Operation Response:", operationResponse.data);

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
              "ไม่สามารถอัปเดตรายละเอียดของผู้ป่วยได้ กรุณาลองใหม่อีกครั้ง",
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
      console.error("Error in onFinish:", error);
      notification.error({
        message: "เกิดปัญหาในการดำเนินการคำขอของคุณ กรุณาลองใหม่อีกครั้ง",
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
      onOk: onFinish,
    });
  };

  useEffect(() => {
    if (hnInputRef.current?.input) {
      if (!hnMaskRef.current) {
        hnMaskRef.current = IMask(hnInputRef.current.input, {
          mask: "00-00-000000",
        });
      } else {
        hnMaskRef.current.updateValue();
      }
    }

    if (dobInputRef.current?.input) {
      if (!dobMaskRef.current) {
        dobMaskRef.current = IMask(dobInputRef.current.input, {
          mask: "0000/00/00",
        });
      } else {
        dobMaskRef.current.updateValue();
      }
    }

    return () => {
      hnMaskRef.current?.destroy();
      dobMaskRef.current?.destroy();
    };
  }, []);

  const handleSeachHNClick = async () => {
    const hnCode = patientData.patient_hn_code;

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

        const formattedDob = patientInfo?.dob
          ? dayjs(patientInfo.dob).format("YYYY-MM-DD")
          : null;

        console.log("patientInfo", patientInfo);

        const updatedPatientData = {
          ...patientData, // เก็บค่าฟิลด์อื่น ๆ ที่มีอยู่ใน patientData ไว้
          patient_hn_code: patientInfo.hn_code || hnCode,
          patient_firstname: patientInfo.firstname || "",
          patient_lastname: patientInfo.lastname || "",
          patient_gender: patientInfo.gender || null,
          patient_dob: formattedDob,
        };

        setPatientData(updatedPatientData);
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
        patient_firstname: "",
        patient_lastname: "",
        patient_gender: null,
        patient_dob: null,
      };

      setPatientData(updatedPatientData);

      form.setFieldsValue(updatedPatientData);

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

  const getFormattedDob = () => {
    const { patient_dob_year, patient_dob_month, patient_dob_day } =
      patientDobData;
    if (patient_dob_year && patient_dob_month && patient_dob_day) {
      return `${patient_dob_year}-${patient_dob_month.padStart(
        2,
        "0"
      )}-${patient_dob_day.padStart(2, "0")}`;
    }
    return "";
  };

  const handlePatientDobChange = (field, value) => {
    setPatientDobData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const updateDobInPatientData = () => {
    const formattedDob = getFormattedDob();
    handlePatientDataChange("patient_dob", formattedDob);
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
              <p className="text-black">Edit Case</p>
              <p className="text-blue-600 ml-2">#{hn}</p>
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
                        Patient Information
                      </h2>
                    </div>
                    <Form.Item
                      label={
                        <span className="text-base font-medium text-gray-700">
                          Hospital Number Code
                        </span>
                      }
                      name="patient_hn_code"
                      rules={[
                        {
                          required: true,
                          message: "Please enter the hospital number code!",
                        },
                      ]}
                    >
                      <div className="flex space-x-2 max-w-md">
                        <Input
                          name="patient_hn_code"
                          value={patientData.patient_hn_code}
                          onChange={(event) =>
                            handlePatientDataChange(
                              "patient_hn_code",
                              event.target.value
                            )
                          }
                          ref={hnInputRef}
                          placeholder="Enter HN code"
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
                            First Name
                          </span>
                        }
                        name="patient_firstname"
                        rules={[
                          {
                            required: true,
                            message: "Please enter the first name!",
                          },
                        ]}
                      >
                        <Input
                          name="patient_firstname"
                          value={patientData.patient_firstname}
                          onChange={(event) =>
                            handlePatientDataChange(
                              "patient_firstname",
                              event.target.value
                            )
                          }
                          className="h-11 text-base rounded-lg"
                          placeholder="Enter First Name"
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            Last Name
                          </span>
                        }
                        name="patient_lastname"
                        rules={[
                          {
                            required: true,
                            message: "Please enter the last name!",
                          },
                        ]}
                      >
                        <Input
                          name="patient_lastname"
                          value={patientData.patient_lastname}
                          onChange={(e) =>
                            handlePatientDataChange(
                              "patient_lastname",
                              e.target.value
                            )
                          }
                          className="h-11 text-base rounded-lg"
                          placeholder="Enter Last Name"
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            Gender
                          </span>
                        }
                        name="patient_gender"
                        rules={[
                          { required: true, message: "Please select gender!" },
                        ]}
                      >
                        <Select
                          value={patientData.patient_gender}
                          onChange={(e) =>
                            handlePatientDataChange(
                              "patient_gender",
                              e.target.value
                            )
                          }
                          className="h-11 text-base"
                          placeholder="Select gender"
                        >
                          <Option value="male">Male</Option>
                          <Option value="female">Female</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            Date of Birth
                          </span>
                        }
                      >
                        <div className="flex">
                          <Input
                            name="patient_dob_year"
                            value={patientData.patient_dob_year}
                            onChange={(e) =>
                              handlePatientDobChange(
                                "patient_dob_year",
                                e.target.value
                              )
                            }
                            placeholder="YYYY"
                            className="h-11 text-base rounded-lg"
                            maxLength={4}
                          />
                          <Input
                            name="patient_dob_month"
                            value={patientData.patient_dob_month}
                            onChange={(e) =>
                              handlePatientDobChange(
                                "patient_dob_month",
                                e.target.value
                              )
                            }
                            placeholder="MM"
                            className="h-11 text-base rounded-lg"
                            maxLength={2}
                          />
                          <Input
                            name="patient_dob_day"
                            value={patientData.patient_dob_day}
                            onChange={(e) =>
                              handlePatientDobChange(
                                "patient_dob_day",
                                e.target.value
                              )
                            }
                            placeholder="DD"
                            className="h-11 text-base rounded-lg"
                            maxLength={2}
                            onBlur={updateDobInPatientData}
                          />
                        </div>

                        <div className="mt-2 text-gray-500">
                          Formatted DOB: {getFormattedDob()}
                        </div>
                      </Form.Item>
                    </div>
                  </section>

                  {/* Surgery Details Section */}
                  <section className="bg-white">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-2 h-8 bg-purple-600 rounded-full" />
                      <h2 className="text-xl font-semibold text-gray-800">
                        Surgery Details
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            Select Doctor
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
                          {doctors.map((doctor) => (
                            <Option
                              key={doctor.doctor_id}
                              value={doctor.doctor_id}
                            >
                              {doctor.prefix} {doctor.firstname}{" "}
                              {doctor.lastname}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            Operation
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
                            Surgery Type
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
                          {surgeryTypes.map((type) => (
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
                            OR-Room
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
                          {operatingRooms.map((room) => (
                            <Option
                              key={room.operating_room_id}
                              value={room.operating_room_id}
                            >
                              {room.room_name} ({room.location})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            Surgery Date
                          </span>
                        }
                        name="surgery_date"
                        rules={[
                          { required: true, message: "Please pick a date!" },
                        ]}
                      >
                        <DatePicker className="h-11 text-base rounded-lg w-full" />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            Estimate Start Time
                          </span>
                        }
                        name="estimate_start_time"
                        rules={[
                          { required: true, message: "Please pick a time!" },
                        ]}
                      >
                        <TimePicker
                          name="estimate_start_time"
                          value={surgeryData.estimate_start_time}
                          onChange={(time) =>
                            handleSurgeryDataChange(
                              "estimate_start_time",
                              time ? time.format("HH:mm") : null
                            )
                          }
                          format="HH:mm"
                          className="h-11 text-base rounded-lg w-full"
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-base font-medium text-gray-700">
                            Estimate Duration (in hours)
                          </span>
                        }
                        name="estimate_duration"
                        rules={[
                          {
                            required: true,
                            message: "Please enter the duration!",
                          },
                          {
                            validator: (_, value) =>
                              value > 0
                                ? Promise.resolve()
                                : Promise.reject(
                                    new Error("Duration must be greater than 0")
                                  ),
                          },
                        ]}
                      >
                        <Input
                          name="estimate_duration"
                          placeholder="Input estimate duration (in hours)"
                          value={
                            surgeryData.estimate_duration
                              ? (surgeryData.estimate_duration / 60).toFixed(2)
                              : ""
                          }
                          onChange={(e) => {
                            const hours = parseFloat(e.target.value) || 0;
                            const minutes = Math.round(hours * 60);
                            handleSurgeryDataChange(
                              "estimate_duration",
                              minutes
                            );
                          }}
                          type="number"
                          step="0.01"
                          className="h-11 text-base rounded-lg w-full"
                        />
                      </Form.Item>
                    </div>
                    <Form.Item
                      label={
                        <span className="text-base font-medium text-gray-700">
                          Patient History
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
                    </Form.Item>
                  </section>

                  {/* Bottom Action Buttons */}
                  <div className="flex justify-center space-x-4 pt-6 border-t w-full">
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="text-lg h-11 px-8 bg-blue-600 hover:bg-blue-700 flex items-center justify-center w-full"
                    >
                      Submit
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
