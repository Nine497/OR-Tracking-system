import React, { useState, useEffect } from "react";
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
} from "antd";
import { Icon } from "@iconify/react";
import IMask from "imask";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const { Step } = Steps;
const { Option } = Select;

function AddCase() {
  const [currentStep, setCurrentStep] = useState(0);
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

  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
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
    status_id: "0",
    created_by: user.id,
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);

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
      } finally {
        setDoctorsLoading(false);
      }
    };

    const fetchOperatingRooms = async () => {
      try {
        setOperatingRoomsLoading(true);

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
      } finally {
        setOperatingRoomsLoading(false);
      }
    };

    const fetchAllSurgeryTypes = async () => {
      try {
        setSurgeryTypesLoading(true);

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
      } finally {
        setSurgeryTypesLoading(false);
      }
    };

    fetchDoctors();
    fetchOperatingRooms();
    fetchAllSurgeryTypes();
  }, []);

  const handlePatientDataChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log("patientData", patientData);
  };

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
        !patientData.firstName ||
        !patientData.lastName ||
        !surgeryData.surgery_date
      ) {
        message.error("Please fill in all required fields.");
        return;
      }

      const token = localStorage.getItem("jwtToken");

      const surgeryCaseData = {
        ...patientData,
        dob: moment(patientData.dob).format("YYYY-MM-DD"),
        surgery_date: moment(surgeryData.surgery_date).format("YYYY-MM-DD"),
        estimate_start_time: moment(
          surgeryData.estimate_start_time,
          "HH:mm"
        ).format("HH:mm"),
        estimate_duration: surgeryData.estimate_duration,
        surgery_type_id: surgeryData.surgery_type_id,
        operating_room_id: surgeryData.operating_room_id,
        status_id: surgeryData.status_id,
        created_by: surgeryData.created_by,
        doctor_id: surgeryData.doctor_id,
      };

      console.log("Surgery Case Data to be sent:", surgeryCaseData);

      const response = await axiosInstance.post(
        "/surgery_case/",
        surgeryCaseData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
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
    <>
      <div className="p-5">
        <div className="text-3xl font-normal">Add Case</div>
      </div>
      <hr />
      <div className="p-6 rounded-base min-h-full">
        <Steps current={currentStep} size="default" className="mb-8 ">
          <Step
            title={<span className="text-xl font-normal">Patient Data</span>}
          />
          <Step
            title={<span className="text-xl font-normal">Surgery Data</span>}
          />
        </Steps>
        <div className="step-content h-full flex flex-col justify-between">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveConfirm}
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
                      name="firstName"
                      rules={[
                        {
                          required: true,
                          message: "Please enter the first name!",
                        },
                      ]}
                      className="w-full"
                    >
                      <Input
                        name="firstName"
                        value={patientData.firstName}
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
                      name="lastName"
                      rules={[
                        {
                          required: true,
                          message: "Please enter the last name!",
                        },
                      ]}
                      className="w-full"
                    >
                      <Input
                        name="lastName"
                        value={patientData.lastName}
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
                        { required: true, message: "Please select gender!" },
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
                        { required: true, message: "Please pick a date!" },
                      ]}
                      className="w-full"
                    >
                      <Input
                        name="dob"
                        value={patientData.dob}
                        onChange={handlePatientDataChange}
                        placeholder="YYYY/MM/DD"
                        ref={dobInputRef}
                        className="h-10 w-full text-base font-normal border rounded-md border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                      />
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
                  <Input
                    name="hn_code"
                    value={patientData.hn_code}
                    onChange={handlePatientDataChange}
                    ref={hnInputRef}
                    placeholder="hn_code"
                    className="h-10 w-full text-base font-normal border rounded-md border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                  />
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
                        { required: true, message: "Please select a doctor!" },
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
                            {doctor.prefix} {doctor.firstname} {doctor.lastname}
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
                        { required: true, message: "Please pick a date!" },
                      ]}
                      className="w-full"
                    >
                      <DatePicker
                        format="YYYY-MM-DD"
                        value={moment(surgeryData.surgery_date)}
                        onChange={(date, dateString) =>
                          handleSurgeryDataChange("surgery_date", dateString)
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
                        { required: true, message: "Please pick a time!" },
                      ]}
                      className="w-full"
                    >
                      <DatePicker.TimePicker
                        name="estimate_start_time"
                        value={
                          surgeryData.estimate_start_time
                            ? moment(surgeryData.estimate_start_time, "HH:mm")
                            : null
                        }
                        onChange={(value) =>
                          handleSurgeryDataChange("estimate_start_time", value)
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
                                  new Error("Duration must be greater than 0")
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
                  </Col>
                </Row>
              </>
            )}
            {currentStep > 0 ? (
              <div className="w-full flex justify-between items-center border-t pt-4 mt-auto bottom-0 bg-white">
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
              </div>
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
          </Form>
        </div>
      </div>
    </>
  );
}

export default AddCase;
