import React, { useState, useEffect, useRef } from "react";
import {
  Steps,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  message,
  notification,
  Modal,
  Spin,
} from "antd";
import { Icon } from "@iconify/react";
import IMask from "imask";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";
import InputMask from "react-input-mask";

const { Step } = Steps;
const { Option } = Select;

function EditCase() {
  const [currentStep, setCurrentStep] = useState(0);
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

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");
    setSurgery_case_id(id);
  }, [location]);

  const [patientData, setPatientData] = useState({
    patient_id: "",
    firstname: "",
    lastname: "",
    gender: "",
    dob: "",
    hn_code: "",
    patient_history: "",
  });

  const [surgeryData, setSurgeryData] = useState({
    doctor_id: "",
    surgery_date: "",
    estimate_start_time: "",
    estimate_duration: "",
    surgery_type_id: "",
    operating_room_id: "",
    status_id: "",
    created_by: user.id,
  });

  useEffect(() => {
    setIsLoading(true);

    const fetchSurgeryData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get(
          `/surgery_case/patient/${surgery_case_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const surgeryCase = response.data.data;
        console.log(response.data);
        setHN(surgeryCase.patient_hn_code);

        setPatientData({
          patient_id: surgeryCase.patient_id,
          firstname: surgeryCase.patient_firstname,
          lastname: surgeryCase.patient_lastname,
          gender: surgeryCase.patient_gender,
          dob: surgeryCase.patient_dob,
          hn_code: surgeryCase.patient_hn_code,
          patient_history: surgeryCase.patient_history || "",
        });

        setSurgeryData({
          doctor_id: surgeryCase.doctor_id,
          surgery_date: surgeryCase.surgery_date,
          estimate_start_time: surgeryCase.estimate_start_time || "",
          estimate_duration: surgeryCase.estimate_duration || "",
          surgery_type_id: surgeryCase.surgery_type_id,
          operating_room_id: surgeryCase.operating_room_id,
          status_id: surgeryCase.status_id.toString(),
          created_by: user.id,
        });
        console.log("surgeryCase:", surgeryCase);
      } catch (error) {
        console.error("Error fetching surgery case data:", error);
      }
    };

    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get("/doctor/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get("/or_room/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
        const token = localStorage.getItem("jwtToken");
        const response = await axiosInstance.get(
          "/surgery_case/all_surgery_types",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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

  const handlePatientDataChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSurgeryDataChange = (name, value) => {
    setSurgeryData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onFinish = async () => {
    try {
      console.log("Starting onFinish...");
      console.log("Patient Data:", patientData);
      console.log("Surgery Data:", surgeryData);

      const patientDataToSend = {
        hn_code: patientData.hn_code,
        dob: moment(patientData.dob).format("YYYY-MM-DD"),
        firstname: patientData.firstname,
        lastname: patientData.lastname,
        gender: patientData.gender,
        patient_history: patientData.patient_history,
      };
      console.log("Patient Data to Send:", patientDataToSend);

      const surgeryCaseDataToSend = {
        surgery_type_id: surgeryData.surgery_type_id,
        doctor_id: surgeryData.doctor_id,
        surgery_date: moment(surgeryData.surgery_date).format("YYYY-MM-DD"),
        estimate_start_time: moment(
          surgeryData.estimate_start_time,
          "HH:mm"
        ).format("HH:mm"),
        estimate_duration: surgeryData.estimate_duration,
        operating_room_id: surgeryData.operating_room_id,
        created_by: surgeryData.created_by,
      };
      console.log("Surgery Case Data to Send:", surgeryCaseDataToSend);

      const token = localStorage.getItem("jwtToken");
      if (!token) {
        console.error("JWT Token not found");
        notification.error({
          message: "Authorization Error",
          description: "JWT Token is missing. Please log in again.",
        });
        return;
      }

      const surgeryCaseResponse = await axiosInstance.put(
        `/surgery_case/${surgery_case_id}`,
        surgeryCaseDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Surgery Case Response:", surgeryCaseResponse.data);

      if (surgeryCaseResponse.status === 200) {
        const patientResponse = await axiosInstance.put(
          `/patient/${patientData.patient_id}`,
          patientDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Patient Response:", patientResponse.data);

        if (patientResponse.status === 200) {
          navigate("/admin/case_manage");
          notification.success({
            message: "Update Successful",
            description: "Patient and Surgery Case updated successfully!",
          });
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

  const next = () => {
    form
      .validateFields()
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch((error) => {
        console.log("Validate Failed:", error);
      });
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    surgeryData.status_id && (
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
          <div className="p-5">
            <div className="text-3xl font-normal flex flex-row">
              <p className="text-black">Edit Case</p>
              <p className="text-blue-600 ml-2">#{hn}</p>
            </div>
            <hr />
            <div className="p-6 rounded-base min-h-full">
              <Steps current={currentStep} size="default" className="mb-8">
                <Step
                  title={
                    <span className="text-xl font-normal">Patient Data</span>
                  }
                />
                <Step
                  title={
                    <span className="text-xl font-normal">Surgery Data</span>
                  }
                />
              </Steps>
              <div className="step-content h-full flex flex-col justify-between">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveConfirm}
                  initialValues={{
                    firstname: patientData.firstname,
                    lastname: patientData.lastname,
                    gender: patientData.gender,
                    dob: moment(patientData.dob).format("YYYY-MM-DD"),
                    hn_code: patientData.hn_code,
                    patient_history: patientData.patient_history,
                    doctor_id: surgeryData.doctor_id,
                    surgery_date: moment(surgeryData.surgery_date),
                    estimate_start_time: surgeryData.estimate_start_time
                      ? moment(surgeryData.estimate_start_time, "HH:mm")
                      : null,
                    estimate_duration: surgeryData.estimate_duration
                      ? (surgeryData.estimate_duration / 60).toFixed(2)
                      : "",
                    surgery_type_id: surgeryData.surgery_type_id,
                    operating_room_id: surgeryData.operating_room_id,
                  }}
                  className="flex-grow space-y-4"
                >
                  {currentStep === 0 && (
                    <>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="text-base font-normal text-gray-700">
                                First Name
                              </span>
                            }
                            name="firstname"
                            rules={[
                              {
                                required: true,
                                message: "Please enter the first name!",
                              },
                            ]}
                            className="w-full"
                          >
                            <Input
                              name="firstname"
                              value={patientData.firstname}
                              onChange={handlePatientDataChange}
                              className=" h-10 w-full text-base font-normal li border rounded-md border-gray-300 "
                              prefix={
                                <Icon
                                  icon="lucide:user"
                                  className="mr-2 text-blue-500 h-4 w-4"
                                />
                              }
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="text-base font-normal text-gray-700">
                                Last Name
                              </span>
                            }
                            name="lastname"
                            rules={[
                              {
                                required: true,
                                message: "Please enter the last name!",
                              },
                            ]}
                            className="w-full"
                          >
                            <Input
                              name="lastname"
                              value={patientData.lastname}
                              onChange={handlePatientDataChange}
                              className="h-10 w-full text-base font-normal border rounded-md border-gray-300"
                              prefix={
                                <Icon
                                  icon="lucide:user"
                                  className="mr-2 text-blue-500 h-4 w-4"
                                />
                              }
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="text-base font-normal text-gray-700">
                                Gender
                              </span>
                            }
                            name="gender"
                            rules={[
                              {
                                required: true,
                                message: "Please select gender!",
                              },
                            ]}
                            className="w-full"
                          >
                            <Select
                              value={patientData.gender}
                              onChange={(value) =>
                                handlePatientDataChange({
                                  target: { name: "gender", value },
                                })
                              }
                              className="h-10 w-full text-base font-normal"
                              placeholder="Select gender"
                            >
                              <Option value="male">Male</Option>
                              <Option value="female">Female</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="text-base font-normal text-gray-700">
                                Date of Birth
                              </span>
                            }
                            name="dob"
                            rules={[
                              {
                                required: true,
                                message: "Please pick a date!",
                              },
                            ]}
                            className="w-full"
                          >
                            <InputMask
                              mask="9999/99/99"
                              value={patientData.dob}
                              onChange={handlePatientDataChange}
                              maskChar=" "
                            >
                              {(inputProps) => (
                                <Input
                                  {...inputProps}
                                  name="dob"
                                  placeholder="YYYY/MM/DD"
                                  className="h-10 w-full text-base font-normal border rounded-md border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                                />
                              )}
                            </InputMask>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        label={
                          <span className="text-base font-normal text-gray-700">
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
                        className="w-full"
                      >
                        <InputMask
                          mask="99-99-999999"
                          value={patientData.hn_code}
                          onChange={handlePatientDataChange}
                          maskChar=" "
                        >
                          {(inputProps) => (
                            <Input
                              {...inputProps}
                              name="hn_code"
                              placeholder="hn_code"
                              className="h-10 w-full text-base font-normal border rounded-md border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                            />
                          )}
                        </InputMask>
                      </Form.Item>

                      <Form.Item
                        label={
                          <span className="text-base font-normal text-gray-700">
                            Patient History
                          </span>
                        }
                        name="patient_history"
                        className="w-full"
                      >
                        <Input.TextArea
                          name="patient_history"
                          value={patientData.patient_history}
                          onChange={handlePatientDataChange}
                          rows={4}
                          className="w-full text-base font-normal border rounded-md border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                        />
                      </Form.Item>
                    </>
                  )}
                  {currentStep === 1 && (
                    <>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="text-base font-normal text-gray-700">
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
                            className="w-full"
                          >
                            <Select
                              value={surgeryData.doctor_id}
                              onChange={(value) =>
                                handleSurgeryDataChange("doctor_id", value)
                              }
                              className="h-10 w-full text-base font-normal"
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
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="text-base font-normal text-gray-700">
                                Surgery Date
                              </span>
                            }
                            name="surgery_date"
                            rules={[
                              {
                                required: true,
                                message: "Please pick a date!",
                              },
                            ]}
                            className="w-full"
                          >
                            <DatePicker
                              format="YYYY-MM-DD"
                              value={moment(surgeryData.surgery_date)}
                              onChange={(date, dateString) =>
                                handleSurgeryDataChange(
                                  "surgery_date",
                                  dateString
                                )
                              }
                              className="h-10 w-full text-base border rounded-md border-gray-300 focus:border-blue-400"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="text-base font-normal text-gray-700">
                                Estimate Start Time
                              </span>
                            }
                            name="estimate_start_time"
                            rules={[
                              {
                                required: true,
                                message: "Please pick a time!",
                              },
                            ]}
                            className="w-full"
                          >
                            <DatePicker.TimePicker
                              name="estimate_start_time"
                              value={
                                surgeryData.estimate_start_time
                                  ? moment(
                                      surgeryData.estimate_start_time,
                                      "HH:mm"
                                    )
                                  : null
                              }
                              onChange={(value) =>
                                handleSurgeryDataChange(
                                  "estimate_start_time",
                                  value
                                )
                              }
                              format="HH:mm"
                              className="h-10 w-full text-base border rounded-md border-gray-300 focus:border-blue-400"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="text-base font-normal text-gray-700">
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
                                        new Error(
                                          "Duration must be greater than 0"
                                        )
                                      ),
                              },
                            ]}
                            className="w-full"
                          >
                            <Input
                              name="estimate_duration"
                              placeholder="Input estimate duration (in hours)"
                              value={
                                surgeryData.estimate_duration
                                  ? (
                                      surgeryData.estimate_duration / 60
                                    ).toFixed(2)
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
                              className="h-10 w-full text-base border rounded-md border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="text-base font-normal text-gray-700">
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
                                handleSurgeryDataChange(
                                  "surgery_type_id",
                                  value
                                )
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
                                    <span className="font-semibold">
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
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={
                              <span className="text-base font-normal text-gray-700">
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
                                handleSurgeryDataChange(
                                  "operating_room_id",
                                  value
                                )
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
                        </Col>
                      </Row>
                    </>
                  )}
                  <div className="w-full flex justify-between items-center border-t pt-4 mt-auto bottom-0 bg-white">
                    {currentStep > 0 ? (
                      <>
                        <Button
                          onClick={prev}
                          className="h-10 px-6 text-base font-normal flex items-center mr-10"
                        >
                          <Icon icon="mdi:arrow-left" className="mr-2" />
                          Previous
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-base font-normal flex items-center"
                        >
                          Submit
                          <Icon icon="mdi:check-circle" className="ml-2" />
                        </Button>
                      </>
                    ) : (
                      <div className="w-full flex justify-end items-center border-t pt-4 mt-auto bottom-0 bg-white">
                        <Button
                          type="primary"
                          onClick={next}
                          className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-base font-normal flex items-center"
                        >
                          Next
                          <Icon icon="mdi:arrow-right" className="ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Form>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
}

export default EditCase;
