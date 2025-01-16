import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  notification,
  Modal,
} from "antd";
import { Icon } from "@iconify/react";
import IMask from "imask";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import CustomNotification from "../CustomNotification";
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
        const response = await axiosInstance.get("/doctor/");

        if (response.status === 200) {
          setDoctors(response.data.data);
        } else {
          throw new Error(`Failed to fetch doctors: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);

        notification.error({
          message: "Error",
          description: "Failed to load doctors. Please try again later.",
          placement: "topRight",
        });
      } finally {
        setDoctorsLoading(false);
      }
    };

    const fetchOperatingRooms = async () => {
      try {
        setOperatingRoomsLoading(true);

        const response = await axiosInstance.get("/or_room/");
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
          message: "Error",
          description:
            "Failed to load operating rooms. Please try again later.",
          placement: "topRight",
        });
      } finally {
        setOperatingRoomsLoading(false);
      }
    };

    const fetchAllSurgeryTypes = async () => {
      try {
        setSurgeryTypesLoading(true);

        const response = await axiosInstance.get(
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
          message: "Error",
          description: "Failed to load surgery types. Please try again later.",
          placement: "topRight",
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

  const onFinish = async () => {
    try {
      if (
        !patientData.firstname ||
        !patientData.lastname ||
        !surgeryData.surgery_date
      ) {
        message.error("Please fill in all required fields.");
        return;
      }

      const patientRequestData = {
        hn_code: patientData.hn_code,
        first_name: patientData.firstname,
        last_name: patientData.lastname,
        dob: dayjs(patientData.dob).format("YYYY-MM-DD"),
        gender: patientData.gender,
      };

      const patientResponse = await axiosInstance.post(
        "/patient/",
        patientRequestData
      );

      if (!patientResponse.data || !patientResponse.data.patient.patient_id) {
        throw new Error("Failed to create or find patient.");
      }

      const patientId = patientResponse.data.patient.patient_id;

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

      console.log("Surgery Case Data to be sent:", surgeryCaseData);

      const caseResponse = await axiosInstance.post(
        `/surgery_case/${patientId}`,
        surgeryCaseData
      );

      if (caseResponse.status === 201) {
        navigate("/admin/case_manage");

        notification.success({
          message: "Surgery Case Created Successfully!",
          description: "The surgery case was created successfully.",
        });
      } else {
        notification.error({
          message: "Failed to Create Surgery Case",
          description: "There was an issue creating the surgery case.",
        });
      }
    } catch (error) {
      console.error("Error during onFinish:", error);
      notification.error({
        message: "An Error Occurred",
        description:
          "An error occurred while processing your request. Please try again.",
      });
    }
  };

  const handleSaveConfirm = () => {
    Modal.confirm({
      title: "Confirm Save",
      content: "Are you sure you want to save this surgery case?",
      okText: "Yes, Save",
      cancelText: "Cancel",
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
        const response = await axiosInstance.get(
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

          setPatientData({
            hn_code,
            firstname,
            lastname,
            gender,
            dob: dayjs(dob).format("YYYY-MM-DD"),
            patient_history,
          });

          form.setFieldsValue({
            hn_code,
            firstname,
            lastname,
            gender,
            dob: dayjs(dob).format("YYYY-MM-DD"),
            patient_history,
          });
          CustomNotification.success("ค้นหาสำเร็จ", "พบข้อมูลผู้ป่วยในระบบ");
        } else {
          CustomNotification.error("ไม่พบข้อมูล", "ไม่พบข้อมูลผู้ป่วยในระบบ");
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        form.setFieldsValue({
          hn_code: "",
          firstname: "",
          lastname: "",
          gender: null,
          dob: "",
          patient_history: "",
        });
        CustomNotification.error("ไม่พบข้อมูล", "ไม่พบข้อมูลผู้ป่วยในระบบ");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Updated patientData:", patientData);
  }, [patientData]);

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
                  name="dob"
                  rules={[{ required: true, message: "Please pick a date!" }]}
                >
                  <Input
                    name="dob"
                    value={patientData.dob}
                    onChange={handlePatientDataChange}
                    placeholder="YYYY/MM/DD"
                    ref={dobInputRef}
                    className="h-11 text-base rounded-lg"
                  />
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
