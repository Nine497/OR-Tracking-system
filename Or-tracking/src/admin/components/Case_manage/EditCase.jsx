import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  notification,
  Modal,
  Spin,
  TimePicker,
} from "antd";
import { Icon } from "@iconify/react";
import IMask from "imask";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import CustomNotification from "../CustomNotification";
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
        const response = await axiosInstance.get(
          `/surgery_case/patient/${surgery_case_id}`
        );

        const surgeryCase = response.data.data;
        console.log(response.data, "dadadada");

        if (!surgeryCase) {
          throw new Error("No surgery case data found");
        }

        const transformedSurgeryData = {
          surgery_case_id: surgeryCase.surgery_case_id,
          surgery_date: surgeryCase?.surgery_date
            ? dayjs(surgeryCase.surgery_date)
            : null,
          estimate_start_time: surgeryCase?.estimate_start_time
            ? dayjs(surgeryCase.estimate_start_time, "HH:mm")
            : null,
          estimate_duration: surgeryCase?.estimate_duration || null,
          surgery_type_id: surgeryCase?.surgery_type_id || null,
          operating_room_id: surgeryCase?.operating_room_id || null,
          status_id: surgeryCase?.status_id || null,
          operation_id: surgeryCase?.operation_id || null,
          operation_name: surgeryCase?.operation_name || null,
        };

        const transformedPatientData = {
          patient_hn_code: surgeryCase?.patient_hn_code || "",
          patient_firstname: surgeryCase?.patient_firstname || "",
          patient_lastname: surgeryCase?.patient_lastname || "",
          patient_gender: surgeryCase?.patient_gender || "",
          patient_dob: surgeryCase?.patient_dob
            ? dayjs(surgeryCase.patient_dob).format("YYYY-MM-DD")
            : null,
        };

        // Log ข้อมูลที่แยกออกมา
        console.log("Transformed surgeryData:", transformedSurgeryData);
        console.log("Transformed patientData:", transformedPatientData);

        // อัปเดต state ด้วยข้อมูลที่แยกออกมา
        setSurgeryData(transformedSurgeryData);
        setPatientData(transformedPatientData); // ตั้งค่า state ของข้อมูลผู้ป่วย

        // Setting HN code
        setHN(surgeryCase?.patient_hn_code || "");
      } catch (error) {
        console.error("Error fetching surgery case data:", error);
      }
    };

    const fetchDoctors = async () => {
      try {
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
      }
    };

    const fetchOperatingRooms = async () => {
      try {
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
      }
    };

    const fetchAllSurgeryTypes = async () => {
      try {
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
        patient_history: surgeryData.patient_history,
      };

      const OperationDataToSend = {
        operation_name: surgeryData.operation_name,
        surgery_case_id: surgery_case_id,
      };
      console.log("Surgery Case Data to Send:", surgeryCaseDataToSend);
      console.log("Patient Case Data to Send:", patientDataToSend);
      console.log("Operation Data to Send:", OperationDataToSend);

      // Update Surgery Case
      const surgeryCaseResponse = await axiosInstance.put(
        `/surgery_case/${surgery_case_id}`,
        surgeryCaseDataToSend
      );
      console.log("Surgery Case Response:", surgeryCaseResponse.data);

      if (surgeryCaseResponse.status === 200) {
        // Update Patient Data
        const patientResponse = await axiosInstance.put(
          `/patient/${surgeryData.patient_id}`,
          patientDataToSend
        );
        console.log("Patient Response:", patientResponse.data);

        if (patientResponse.status === 200) {
          // Add Operation Data
          const operationResponse = await axiosInstance.post(
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
              message: "Update Successful",
              description: "Patient and Surgery Case updated successfully!",
            });
          } else {
            notification.error({
              message: "Failed to Add Operation Data",
              description: "There was an issue adding the operation data.",
            });
          }
        } else {
          notification.error({
            message: "Failed to Update Patient",
            description: "There was an issue updating the patient details.",
          });
        }
      } else {
        notification.error({
          message: "Failed to Update Surgery Case",
          description: "There was an issue updating the surgery case.",
        });
      }
    } catch (error) {
      console.error("Error in onFinish:", error);
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
      content: "Are you sure you want to save this edited surgery case?",
      okText: "Yes, Save",
      cancelText: "Cancel",
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
    if (hnCode) {
      setSearchIsLoading(true);

      try {
        const response = await axiosInstance.get(
          `/patient/getPatientData/${hnCode}`
        );

        if (response.data) {
          const {
            patient_hn_code = "",
            patient_firstname = "",
            patient_lastname = "",
            patient_gender = "",
            patient_dob = "",
          } = response.data;

          setPatientData({
            patient_hn_code,
            patient_firstname,
            patient_lastname,
            patient_gender,
            patient_dob: dayjs(patient_dob).format("YYYY-MM-DD"), // ใช้ dayjs แปลงวันที่
          });

          // อัปเดตฟอร์ม
          form.setFieldsValue({
            patient_hn_code,
            patient_firstname,
            patient_lastname,
            patient_gender,
            patient_dob: dayjs(patient_dob).format("YYYY-MM-DD"),
          });

          // แจ้งเตือนสำเร็จ
          message.success("ค้นหาสำเร็จ: พบข้อมูลผู้ป่วยในระบบ");
        } else {
          // แจ้งเตือนกรณีไม่พบข้อมูล
          message.error("ไม่พบข้อมูล: ไม่พบข้อมูลผู้ป่วยในระบบ");
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        form.setFieldsValue({
          patient_hn_code: "",
          patient_firstname: "",
          patient_lastname: "",
          patient_gender: null,
          patient_dob: null,
        });
        message.error("ไม่พบข้อมูล: ไม่พบข้อมูลผู้ป่วยในระบบ");
      } finally {
        setSearchIsLoading(false);
      }
    } else {
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
                          value={patientData.patient_hn_code || ""}
                          onChange={(event) =>
                            handleSurgeryDataChange(
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
                          value={patientData.patient_firstname || ""}
                          onChange={(event) =>
                            handleSurgeryDataChange(
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
                          onChange={(value) =>
                            handleSurgeryDataChange("patient_lastname", value)
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
                          onChange={(value) =>
                            handleSurgeryDataChange("patient_gender", value)
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
                        name="patient_dob"
                        rules={[
                          { required: true, message: "Please pick a date!" },
                        ]}
                      >
                        <Input
                          name="patient_dob"
                          value={patientData.patient_dob}
                          onChange={(event) =>
                            handleSurgeryDataChange(
                              "patient_dob",
                              event.target.value
                            )
                          }
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
