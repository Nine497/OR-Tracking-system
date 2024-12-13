import React, { useState } from "react";
import {
  Steps,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  notification,
} from "antd";
import { Icon } from "@iconify/react";

const { Step } = Steps;
const { Option } = Select;

function AddCase() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

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

  const onFinish = () => {
    const allValues = form.getFieldsValue(true);

    const formattedHospitalCode = allValues.hospitalCode.replace(
      /(\d{2})(\d{2})(\d{6})/,
      "$1-$2-$3"
    );

    const updatedValues = { ...allValues, hospitalCode: formattedHospitalCode };

    console.log("Complete form values:", updatedValues);

    notification.success({
      message: "Success",
      description: "Your form has been submitted successfully.",
    });
  };

  return (
    <>
      <div className="flex flex-row p-7 justify-between">
        <div className="text-3xl font-semibold">Add Case</div>
      </div>
      <hr />
      <div className="p-6 rounded-base">
        <Steps current={currentStep} size="default" className="mb-8 ">
          <Step
            title={<span className="text-xl font-semibold">Patient Data</span>}
          />
          <Step
            title={<span className="text-xl font-semibold">Surgery Data</span>}
          />
        </Steps>

        <div className="step-content">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-4"
          >
            {currentStep === 0 && (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <span className="text-base font-medium text-gray-700">
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
                        className=" h-10 w-full text-[1.125rem] font-[450] li border rounded-md border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
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
                        <span className="text-base font-medium text-gray-700">
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
                        className="h-10 w-full text-[1.125rem] font-[450] border rounded-md border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
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
                        <span className="text-base font-medium text-gray-700">
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
                        className="h-10 w-full font-normal text-lg"
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
                        <span className="text-base font-medium text-gray-700">
                          Date of Birth
                        </span>
                      }
                      name="dob"
                      rules={[
                        { required: true, message: "Please pick a date!" },
                      ]}
                      className="w-full"
                    >
                      <DatePicker
                        size="middle"
                        format="YYYY-MM-DD"
                        className="h-10 w-full font-normal text-lg text-gray-700 border rounded-md border-gray-300 focus:border-blue-400"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <span className="text-base font-medium text-gray-700">
                      Hospital Number Code
                    </span>
                  }
                  name="hospitalCode"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the hospital number code!",
                    },
                  ]}
                  className="w-full"
                >
                  <Input
                    maxLength={10}
                    className="h-10 w-full text-[1.125rem] font-[450] border rounded-md border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-base font-medium text-gray-700">
                      Patient History
                    </span>
                  }
                  name="history"
                  className="w-full"
                >
                  <Input.TextArea
                    rows={4}
                    className="w-full text-lg font-normal border rounded-md border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                  />
                </Form.Item>

                <div className="flex justify-end">
                  <Button
                    type="primary"
                    onClick={next}
                    className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}

            {currentStep === 1 && (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <span className="text-base font-medium text-gray-700">
                          Select Doctor
                        </span>
                      }
                      name="doctor"
                      rules={[
                        { required: true, message: "Please select a doctor!" },
                      ]}
                      className="w-full"
                    >
                      <Select className="h-10 w-full text-base font-medium">
                        <Option value="doctor1">Dr. John Doe</Option>
                        <Option value="doctor2">Dr. Jane Smith</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <span className="text-base font-medium text-gray-700">
                          Surgery Date
                        </span>
                      }
                      name="surgeryDate"
                      rules={[
                        { required: true, message: "Please pick a date!" },
                      ]}
                      className="w-full"
                    >
                      <DatePicker
                        format="YYYY-MM-DD"
                        className="h-10 w-full text-base border rounded-md border-gray-300 focus:border-blue-400"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <span className="text-base font-medium text-gray-700">
                          Estimate Start Time
                        </span>
                      }
                      name="startTime"
                      rules={[
                        { required: true, message: "Please pick a time!" },
                      ]}
                      className="w-full"
                    >
                      <DatePicker.TimePicker
                        format="HH:mm"
                        className="h-10 w-full text-base border rounded-md border-gray-300 focus:border-blue-400"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <span className="text-base font-medium text-gray-700">
                          Estimate Duration (in minutes)
                        </span>
                      }
                      name="duration"
                      rules={[
                        {
                          required: true,
                          message: "Please enter the duration!",
                        },
                      ]}
                      className="w-full"
                    >
                      <Input
                        type="number"
                        className="h-10 w-full text-base border rounded-md border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <span className="text-base font-medium text-gray-700">
                      Surgery Type
                    </span>
                  }
                  name="surgeryType"
                  rules={[
                    { required: true, message: "Please select surgery type!" },
                  ]}
                  className="w-full"
                >
                  <Select className="h-10 w-full text-base font-medium">
                    <Option value="surgery1">Surgery Type 1</Option>
                    <Option value="surgery2">Surgery Type 2</Option>
                  </Select>
                </Form.Item>

                <div className="flex justify-between border-t pt-4 mt-4">
                  <Button
                    onClick={prev}
                    className="h-10 px-6 text-base font-medium"
                  >
                    Previous
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium"
                  >
                    Submit
                  </Button>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </>
  );
}

export default AddCase;
