import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Modal,
  notification,
} from "antd";
import { Icon } from "@iconify/react";
import IMask from "imask";
import { axiosInstanceStaff } from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import "./Form.css";

const { Option } = Select;

function AddCase() {
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
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [patientDobData, setPatientDobData] = useState(null);
  const yearRef = useRef(null);
  const monthRef = useRef(null);
  const dayRef = useRef(null);

  const [patientData, setPatientData] = useState({
    hn_code: "",
    firstname: "",
    lastname: "",
    gender: "",
    dob: "",
  });

  const [surgeryData, setSurgeryData] = useState({
    doctor_id: "",
    surgery_date: "",
    surgery_start_time: "",
    surgery_end_time: "",
    surgery_type_id: "",
    operating_room_id: "",
    status_id: "0",
    created_by: user.id,
    patient_history: "",
    Operation: "",
    note: "",
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);
        const response = await axiosInstanceStaff.get("/doctor/");

        if (response.status === 200) {
          setDoctors(response.data.data);
        } else {
          throw new Error(
            `ไม่สามารถโหลดข้อมูลแพทย์ได้: ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลแพทย์:", error);
        notification.error({
          message: "ไม่สามารถโหลดข้อมูลแพทย์ได้ กรุณาลองใหม่ภายหลัง",
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
        setOperatingRoomsLoading(true);

        const response = await axiosInstanceStaff.get("/or_room/");
        if (response.status === 200) {
          setOperatingRooms(response.data.data);
        } else {
          throw new Error(
            `ไม่สามารถโหลดข้อมูลห้องผ่าตัดได้: ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลห้องผ่าตัด:", error);
        notification.error({
          message: "ไม่สามารถโหลดข้อมูลห้องผ่าตัดได้ กรุณาลองใหม่ภายหลัง",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      } finally {
        setOperatingRoomsLoading(false);
      }
    };

    const fetchAllSurgeryTypes = async () => {
      try {
        setSurgeryTypesLoading(true);

        const response = await axiosInstanceStaff.get(
          "/surgery_case/all_surgery_types"
        );

        if (response.status === 200) {
          setSurgeryTypes(response.data.data);
        } else {
          throw new Error(
            `ไม่สามารถโหลดข้อมูลประเภทการผ่าตัดได้: ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลประเภทการผ่าตัด:", error);
        notification.error({
          message: "ไม่สามารถโหลดข้อมูลประเภทการผ่าตัดได้ กรุณาลองใหม่ภายหลัง",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      } finally {
        setSurgeryTypesLoading(false);
      }
    };

    fetchDoctors();
    fetchOperatingRooms();
    fetchAllSurgeryTypes();
  }, []);

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
      return `${patient_dob_year.padStart(4, "0")}-${patient_dob_month.padStart(
        2,
        "0"
      )}-${patient_dob_day.padStart(2, "0")}`;
    }
    return "";
  };

  const onFinish = async () => {
    // console.log("patientData", patientData);
    try {
      if (
        !patientData.hn_code ||
        !patientData.firstname ||
        !patientData.lastname ||
        !patientData.dob ||
        !surgeryData.surgery_start_time ||
        !surgeryData.surgery_end_time
      ) {
        message.error("กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน");
        return;
      }

      if (dayjs(patientData.dob).isAfter(dayjs(), "day")) {
        message.error("กรุณากรอกข้อมูลวันเกิดให้ถูกต้อง");
        return;
      }

      const isValidDate = (dateString) => {
        const formattedDate = dayjs(dateString).format("YYYY-MM-DD");

        return dayjs(formattedDate, "YYYY-MM-DD", true).isValid();
      };

      if (!isValidDate(patientData.dob)) {
        message.error("กรุณากรอกข้อมูลวันเกิดให้ถูกต้อง");
        return;
      }

      const surgeryStartTime = dayjs(surgeryData.surgery_start_time);
      const surgeryEndTime = dayjs(surgeryData.surgery_end_time);

      if (surgeryStartTime.isAfter(surgeryEndTime)) {
        message.error("เวลาเริ่มผ่าตัดต้องน้อยกว่าเวลาเสร็จสิ้นการผ่าตัด");
        return;
      }

      // console.log("surgeryStartTime", surgeryStartTime);
      // console.log("surgeryEndTime", surgeryEndTime);

      const patientRequestData = {
        hn_code: patientData.hn_code,
        first_name: patientData.firstname,
        last_name: patientData.lastname,
        gender: patientData.gender,
        dob: patientData.dob,
      };

      const patientResponse = await axiosInstanceStaff.post(
        "/patient/",
        patientRequestData
      );

      if (!patientResponse.data || !patientResponse.data.patient.patient_id) {
        throw new Error("ไม่สามารถสร้างหรือค้นหาข้อมูลผู้ป่วยได้");
      }

      const patientId = patientResponse.data.patient.patient_id;

      const surgeryCaseData = {
        patient_id: patientId,
        doctor_id: surgeryData.doctor_id,
        operating_room_id: surgeryData.operating_room_id,
        created_by: surgeryData.created_by,
        surgery_type_id: surgeryData.surgery_type_id,
        status_id: surgeryData.status_id,
        patient_history: surgeryData.patient_history,
        created_at: dayjs().format("YYYY/MM/DD HH:mm:ss"),
        surgery_start_time: surgeryStartTime.subtract(7, 'hours').format("YYYY/MM/DD HH:mm:ss"),
        surgery_end_time: surgeryEndTime.subtract(7, 'hours').format("YYYY/MM/DD HH:mm:ss"),
        Operation: surgeryData.Operation,
        note: surgeryData.note,
      };

      // console.log("ข้อมูลการผ่าตัดที่ส่งไปยังเซิร์ฟเวอร์:", surgeryCaseData);

      const caseResponse = await axiosInstanceStaff.post(
        `/surgery_case/${patientId}`,
        surgeryCaseData
      );

      if (caseResponse.status === 201) {
        navigate("/admin/case_manage");
        notification.success({
          message: "สร้างข้อมูลเคสการผ่าตัดเรียบร้อยแล้ว",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      } else {
        notification.error({
          message: "ไม่สามารถสร้างเคสการผ่าตัดได้ กรุณาลองใหม่ภายหลัง",
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

  const handleSaveConfirm = () => {
    Modal.confirm({
      title: "ยืนยันการบันทึก",
      content: "คุณแน่ใจหรือไม่ว่าต้องการบันทึกข้อมูลเคสการผ่าตัดนี้?",
      okText: "ใช่, บันทึก",
      cancelText: "ยกเลิก",
      centered: true,
      onOk: onFinish,
    });
  };

  useEffect(() => {
    if (patientData.dob) {
      updateDobInPatientData();
    }
  }, [patientDobData]);

  useEffect(() => {
    if (hnInputRef.current) {
      IMask(hnInputRef.current.input, {
        mask: "00-00-000000",
      });
    }
  }, []);

  const handlePatientDataChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevState) => ({
      ...prevState,
      [name]: value.trim(),
    }));
  };

  const handleSeachHNClick = async () => {
    const hnCode = patientData.hn_code.trim();

    if (hnCode) {
      setIsLoading(true);
      try {
        const response = await axiosInstanceStaff.get(
          `/patient/getPatientData/${hnCode}`
        );

        if (response.data && response.data.data) {
          const {
            hn_code = "",
            firstname = "",
            lastname = "",
            gender = "",
            dob = "",
          } = response.data.data;

          const dobDate = dayjs(dob);

          setPatientData({
            hn_code,
            firstname,
            lastname,
            gender,
            dob,
          });

          const dob_year = dobDate.year();
          const dob_month = String(dobDate.month() + 1).padStart(2, "0");
          const dob_day = String(dobDate.date()).padStart(2, "0");

          form.setFieldsValue({
            hn_code,
            firstname,
            lastname,
            gender,
            patient_dob_year: dob_year,
            patient_dob_month: dob_month,
            patient_dob_day: dob_day,
          });
        } else {
          notification.success({
            message: "ไม่พบข้อมูลผู้ป่วย HN นี้ในระบบ",
            showProgress: true,
            placement: "topRight",
            pauseOnHover: true,
            duration: 2,
          });
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);

        // ล้างค่าในฟอร์มเมื่อเกิดข้อผิดพลาด
        //form.resetFields();

        form.setFieldsValue({
          firstname: "",
          lastname: "",
          gender: null,
          patient_dob_year: null,
          patient_dob_month: null,
          patient_dob_day: null,
        });

        setPatientData({
          ...patientData,
          firstname: "",
          lastname: "",
          gender: "",
          dob: "",
        });

        // แจ้งเตือนเมื่อเกิดข้อผิดพลาด
        notification.error({
          message: "ไม่พบข้อมูลผู้ป่วย HN นี้ในระบบ",
          showProgress: true,
          placement: "topRight",
          pauseOnHover: true,
          duration: 2,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="pb-5">
        <div className="text-3xl font-normal">เพิ่มเคสผ่าตัด</div>
      </div>
      <hr />
      <div className="p-6 rounded-base min-h-full">
        <div className="w-3/4 mx-auto">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveConfirm}
            className="space-y-8"
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
                    หมายเลขของผู้ป่วย
                  </span>
                }
                name="hn_code"
                rules={[
                  {
                    required: true,
                    message: "กรุณากรอก HN",
                  },
                  {
                    validator: (_, value) => {
                      if (!value.trim()) {
                        return Promise.reject("ห้ามเว้นว่างหรือใส่แต่ช่องว่าง");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <div className="flex space-x-2 max-w-md">
                  <Input
                    name="hn_code"
                    value={patientData.hn_code}
                    onChange={handlePatientDataChange}
                    ref={hnInputRef}
                    placeholder="Enter HN code"
                    className="h-11 text-base border rounded-lg"
                  />
                  <Button
                    loading={isLoading}
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
                    { required: true, message: "Please enter the first name!" },
                  ]}
                >
                  <Input
                    name="firstname"
                    value={patientData.firstname}
                    onChange={handlePatientDataChange}
                    className="h-11 text-base rounded-lg"
                    placeholder="Enter First Name"
                    onKeyPress={(e) => {
                      if (!/[a-zA-Zก-๙]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
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
                    { required: true, message: "Please enter the last name!" },
                  ]}
                >
                  <Input
                    name="lastname"
                    value={patientData.lastname}
                    onChange={handlePatientDataChange}
                    className="h-11 text-base rounded-lg"
                    placeholder="Enter Last Name"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-base font-medium text-gray-700">
                      เพศ
                    </span>
                  }
                  name="gender"
                  rules={[{ required: true, message: "Please select gender!" }]}
                >
                  <Select
                    value={patientData.gender}
                    onChange={(value) =>
                      handlePatientDataChange({
                        target: { name: "gender", value },
                      })
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
                          message: "กรุณากรอกเดือนในรูปแบบที่ถูกต้อง (01-12)",
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
                            value.replace(/\D/g, ""),
                            e
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
                          message: "กรุณากรอกวันในรูปแบบที่ถูกต้อง (01-31)",
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
                          handlePatientDobChange("patient_dob_day", value, e);
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
                      เลือกแพทย์
                    </span>
                  }
                  name="doctor_id"
                  rules={[{ required: true, message: "กรุณาเลือกแพทย์!" }]}
                >
                  <Select
                    value={surgeryData.doctor_id}
                    onChange={(value) =>
                      handleSurgeryDataChange("doctor_id", value)
                    }
                    className="h-11 text-base"
                    loading={doctorsLoading}
                    placeholder="เลือกแพทย์"
                  >
                    {doctors
                      .sort((a, b) =>
                        a.firstname.localeCompare(b.firstname, "th", {
                          sensitivity: "base",
                        })
                      )
                      .map((doctor) => (
                        <Option key={doctor.doctor_id} value={doctor.doctor_id}>
                          {doctor.prefix} {doctor.firstname} {doctor.lastname}
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
                  name="Operation"
                  rules={[
                    { required: true, message: "Please enter the Operation!" },
                  ]}
                >
                  <Input
                    name="Operation"
                    value={surgeryData.Operation}
                    onChange={(e) =>
                      handleSurgeryDataChange("Operation", e.target.value)
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
                      message: "Please select a surgery type!",
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
                    {surgeryTypes
                      .sort((a, b) =>
                        a.surgery_type_name.localeCompare(b.surgery_type_name)
                      )
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
                      message: "กรุณาเลือกห้องผ่าตัด!",
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
                    placeholder="เลือกห้องผ่าตัด"
                  >
                    {[
                      ...operatingRooms
                        .filter((room) => room.room_name !== "-")
                        .sort((a, b) => {
                          const numA =
                            parseInt(a.room_name.replace(/\D/g, ""), 10) || 0;
                          const numB =
                            parseInt(b.room_name.replace(/\D/g, ""), 10) || 0;
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
                {/* เวลาเริ่มผ่าตัด */}
                <Form.Item
                  label={
                    <span className="text-base font-medium text-gray-700">
                      เวลาเริ่มผ่าตัด
                    </span>
                  }
                  name="surgery_start_time"
                  rules={[
                    { required: true, message: "กรุณาเลือกเวลาเริ่มผ่าตัด!" },
                  ]}
                >
                  <DatePicker
                    showTime={{
                      format: "HH:mm",
                    }}
                    format="YYYY-MM-DD HH:mm"
                    value={
                      surgeryData.surgery_start_time
                        ? dayjs(
                          surgeryData.surgery_start_time,
                          "YYYY/MM/DD HH:mm"
                        )
                        : null
                    }
                    onChange={(date) =>
                      handleSurgeryDataChange(
                        "surgery_start_time",
                        date ? date : null
                      )
                    }
                    className="h-11 text-base rounded-lg w-full"
                    inputReadOnly
                    needConfirm={false}
                  />
                </Form.Item>

                {/* เวลาสิ้นสุดผ่าตัด */}
                <Form.Item
                  label={
                    <span className="text-base font-medium text-gray-700">
                      เวลาสิ้นสุดผ่าตัด
                    </span>
                  }
                  name="surgery_end_time"
                  dependencies={["surgery_start_time"]}
                  rules={[
                    { required: true, message: "กรุณาเลือกเวลาสิ้นสุดผ่าตัด!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const startTime = getFieldValue("surgery_start_time");
                        if (
                          !value ||
                          !startTime ||
                          dayjs(value).isAfter(dayjs(startTime))
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น!")
                        );
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    needConfirm={false}
                    showTime={{ format: "HH:mm" }}
                    format="YYYY/MM/DD HH:mm"
                    value={
                      surgeryData.surgery_end_time
                        ? dayjs(
                          surgeryData.surgery_end_time,
                          "YYYY/MM/DD HH:mm"
                        )
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
                      return startTime && current < startTime.startOf("day");
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
                  value={surgeryData.patient_history}
                  onChange={(e) =>
                    handleSurgeryDataChange("note", e.target.value)
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
                      (ไม่จำเป็น){" "}
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
                    handleSurgeryDataChange("patient_history", e.target.value)
                  }
                  rows={4}
                  className="text-base rounded-lg"
                  placeholder="Enter patient's medical history..."
                />
              </Form.Item> */}
            </section>

            {/* Bottom Action Buttons */}
            <div className="flex justify-center space-x-4 pt-6 border-t w-full">
              <Button
                type="primary"
                htmlType="submit"
                className="text-lg h-11 px-8 bg-blue-600 hover:bg-blue-700 flex items-center justify-center w-full"
              >
                บันทึก
                <Icon icon="mdi:check-circle" className="ml-2" />
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}
<style jsx>{`
  :where(.css-dev-only-do-not-override-1wwf28x).ant-picker
    .ant-picker-input
    > input {
    font-size: 20px;
  }
`}</style>;

export default AddCase;
