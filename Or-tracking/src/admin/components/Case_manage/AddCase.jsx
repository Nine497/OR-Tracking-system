import React, { useState, useEffect } from "react";
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
  const dobInputRef = React.useRef(null);
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [operatingRooms, setOperatingRooms] = useState([]);
  const [operatingRoomsLoading, setOperatingRoomsLoading] = useState(false);
  const [surgeryTypes, setSurgeryTypes] = useState([]);
  const [surgeryTypesLoading, setSurgeryTypesLoading] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [patientDobData, setPatientDobData] = useState({});

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
    estimate_start_time: "",
    estimate_duration: "",
    surgery_type_id: "",
    operating_room_id: "",
    status_id: "0",
    created_by: user.id,
    patient_history: "",
    Operation: "",
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

  const handleSurgeryDataChange = (name, value) => {
    setSurgeryData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log("surgeryData", surgeryData);
  };

  const handlePatientDobChange = (field, value) => {
    if (!/^\d*$/.test(value)) return;
    setPatientDobData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const isValidDate = (year, month, day) => {
    const date = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    );
    return (
      date.getFullYear() === parseInt(year, 10) &&
      date.getMonth() + 1 === parseInt(month, 10) &&
      date.getDate() === parseInt(day, 10)
    );
  };

  const updateDobInPatientData = () => {
    const { patient_dob_year, patient_dob_month, patient_dob_day } =
      patientDobData;

    if (isValidDate(patient_dob_year, patient_dob_month, patient_dob_day)) {
      const formattedDob = getFormattedDob();
      handlePatientDataChange("patient_dob", formattedDob);
    } else {
      console.error("Invalid Date");
    }
  };

  const getFormattedDob = () => {
    const { patient_dob_year, patient_dob_month, patient_dob_day } =
      patientDobData;

    if (patient_dob_year && patient_dob_month && patient_dob_day) {
      return `${patient_dob_year.padStart(4, "0")}-${patient_dob_month.padStart(
        2,
        "0"
      )}-${patient_dob_day.padStart(2, "0")}`;
    }
    return "";
  };

  const onFinish = async () => {
    try {
      if (
        !patientData.firstname ||
        !patientData.lastname ||
        !surgeryData.surgery_date
      ) {
        message.error("กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน");
        return;
      }

      const patientRequestData = {
        hn_code: patientData.hn_code,
        first_name: patientData.firstname,
        last_name: patientData.lastname,
        dob: dayjs(patientData.dob).format("YYYY-MM-DD"),
        gender: patientData.gender,
      };

      const patientResponse = await axiosInstanceStaff.post(
        "/patient/",
        patientRequestData
      );

      if (!patientResponse.data || !patientResponse.data.patient.patient_id) {
        throw new Error("ไม่สามารถสร้างหรือค้นหาข้อมูลผู้ป่วยได้");
      }

      const patientId = patientResponse.data.patient.patient_id; // เก็บ ID ของผู้ป่วย

      const surgeryCaseData = {
        surgery_date: dayjs(surgeryData.surgery_date).format("YYYY-MM-DD"),
        estimate_start_time: dayjs(
          surgeryData.estimate_start_time,
          "HH:mm"
        ).format("HH:mm"),
        estimate_duration: surgeryData.estimate_duration,
        surgery_type_id: surgeryData.surgery_type_id,
        operating_room_id: surgeryData.operating_room_id,
        status_id: surgeryData.status_id,
        created_by: surgeryData.created_by,
        doctor_id: surgeryData.doctor_id,
        patient_history: surgeryData.patient_history,
        Operation: surgeryData.Operation,
      };

      console.log("ข้อมูลการผ่าตัดที่ส่งไปยังเซิร์ฟเวอร์:", surgeryCaseData);

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
      notification.error({
        message: "เกิดข้อผิดพลาดระหว่างดำเนินการ กรุณาลองใหม่ภายหลัง",
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
      content: "คุณแน่ใจหรือไม่ว่าต้องการบันทึกข้อมูลเคสการผ่าตัดนี้?",
      okText: "ใช่, บันทึก",
      cancelText: "ยกเลิก",
      onOk: onFinish,
    });
  };

  useEffect(() => {
    if (hnInputRef.current) {
      IMask(hnInputRef.current.input, {
        mask: "00-00-000000",
      });
    }
    if (dobInputRef.current) {
      IMask(dobInputRef.current.input, {
        mask: "0000/00/00",
      });
    }
  }, []);

  const handlePatientDataChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSeachHNClick = async () => {
    const hnCode = patientData.hn_code;

    if (hnCode) {
      setIsLoading(true);
      try {
        const response = await  axiosInstanceStaff.get(
          `/patient/getPatientData/${hnCode}`
        );

        if (response.data && response.data.data) {
          const {
            hn_code = "",
            firstname = "",
            lastname = "",
            gender = "",
            dob = "",
            patient_history = "",
          } = response.data.data;

          const dobParsed = dayjs(dob);
          const year = dobParsed.isValid() ? dobParsed.format("YYYY") : "";
          const month = dobParsed.isValid() ? dobParsed.format("MM") : "";
          const day = dobParsed.isValid() ? dobParsed.format("DD") : "";

          setPatientData({
            hn_code,
            firstname,
            lastname,
            gender,
            dob,
            patient_dob_year: year,
            patient_dob_month: month,
            patient_dob_day: day,
          });

          setPatientDobData({
            patient_dob_year: year,
            patient_dob_month: month,
            patient_dob_day: day,
          });

          form.setFieldsValue({
            hn_code,
            firstname,
            lastname,
            gender,
            patient_dob_year: year,
            patient_dob_month: month,
            patient_dob_day: day,
            patient_history,
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
        form.setFieldsValue({
          hn_code: "",
          firstname: "",
          lastname: "",
          gender: null,
          patient_dob_year: "",
          patient_dob_month: "",
          patient_dob_day: "",
          patient_history: "",
        });

        setPatientDobData({
          patient_dob_year: "",
          patient_dob_month: "",
          patient_dob_day: "",
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
        <div className="text-3xl font-normal">Add Case</div>
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
                  Patient Information
                </h2>
              </div>
              <Form.Item
                label={
                  <span className="text-base font-medium text-gray-700">
                    Hospital Number Code
                  </span>
                }
                name="hn_code"
                rules={[
                  {
                    required: true,
                    message: "Please enter the hospital number code!",
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
                      First Name
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
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-base font-medium text-gray-700">
                      Last Name
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
                      Gender
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
                  <Input.Group className="flex ">
                    <Input
                      type="number"
                      name="patient_dob_year"
                      value={patientData.patient_dob_year}
                      onChange={(e) =>
                        handlePatientDobChange(
                          "patient_dob_year",
                          e.target.value
                        )
                      }
                      placeholder="YYYY"
                      className="h-11 w-28 text-center text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      maxLength={4}
                    />
                    <Input
                      type="number"
                      name="patient_dob_month"
                      value={patientData.patient_dob_month}
                      onChange={(e) =>
                        handlePatientDobChange(
                          "patient_dob_month",
                          e.target.value
                        )
                      }
                      placeholder="MM"
                      className="h-11 w-20 text-center text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      maxLength={2}
                    />
                    <Input
                      type="number"
                      name="patient_dob_day"
                      value={patientData.patient_dob_day}
                      onChange={(e) =>
                        handlePatientDobChange(
                          "patient_dob_day",
                          e.target.value
                        )
                      }
                      placeholder="DD"
                      className="h-11 w-20 text-center text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      maxLength={2}
                    />
                  </Input.Group>
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
                    { required: true, message: "Please select a doctor!" },
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
                      <Option key={doctor.doctor_id} value={doctor.doctor_id}>
                        {doctor.prefix} {doctor.firstname} {doctor.lastname}
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
                  rules={[{ required: true, message: "Please pick a date!" }]}
                >
                  <DatePicker
                    format="YYYY-MM-DD"
                    value={dayjs(surgeryData.surgery_date)}
                    onChange={(date, dateString) =>
                      handleSurgeryDataChange("surgery_date", dateString)
                    }
                    className="h-11 text-base rounded-lg w-full"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-base font-medium text-gray-700">
                      Estimate Start Time
                    </span>
                  }
                  name="estimate_start_time"
                  rules={[{ required: true, message: "Please pick a time!" }]}
                >
                  <DatePicker.TimePicker
                    name="estimate_start_time"
                    value={
                      surgeryData.estimate_start_time
                        ? dayjs(surgeryData.estimate_start_time, "HH:mm")
                        : null
                    }
                    onChange={(value) =>
                      handleSurgeryDataChange("estimate_start_time", value)
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
                    { required: true, message: "Please enter the duration!" },
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
                      handleSurgeryDataChange("estimate_duration", minutes);
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
                    handleSurgeryDataChange("patient_history", e.target.value)
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
