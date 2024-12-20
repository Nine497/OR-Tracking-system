import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, notification } from "antd";
import IMask from "imask";
import hospitalBedGif from "../assets/hospital-bed.gif";
import hospitalBedStatic from "../assets/hospital-bed-static.png";
import axiosInstance from "../../admin/api/axiosInstance";
import { usePatient } from "../context/PatientContext";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ t, queryParams }) => {
  const [playGif, setPlayGif] = useState(false);
  const hnInputRef = React.useRef(null);
  const { surgery_case_id, setPatient, setSurgeryCase } = usePatient();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const { hn, dob } = values;
      console.log("Payload sent to API:", { hn, dob, surgery_case_id });

      const response = await axiosInstance.post("patient/login", {
        hn,
        dob,
        surgery_case_id,
      });

      if (response.data.valid) {
        localStorage.setItem("token", response.data.token);
        setPatient(response.data.patient_id);
        setSurgeryCase(surgery_case_id);
        navigate("/ptr/view");
        notification.success({ message: t("login.SUCCESS") });
      } else {
        notification.error({ message: t("login.FAILED") });
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || t("login.FAILED");
      notification.error({ message: errorMessage });
    }
  };

  useEffect(() => {
    if (hnInputRef.current) {
      IMask(hnInputRef.current.input, {
        mask: "00-00-000000",
      });
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6 md:px-8">
      <div className="mb-8 transition-transform hover:scale-105 cursor-pointer">
        <img
          src={playGif ? hospitalBedGif : hospitalBedStatic}
          className="w-24 sm:w-32 md:w-40 mx-auto"
          alt="Hospital Bed"
          onClick={() => setPlayGif(true)}
          onMouseEnter={() => setPlayGif(true)}
          onMouseLeave={() => setPlayGif(false)}
        />
      </div>

      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center mb-6 text-gray-800">
        {t("login.TITLE")}
      </h2>

      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
        className="space-y-6"
      >
        <Form.Item
          label={
            <span className="text-sm sm:text-base font-medium text-gray-700">
              {t("login.HN")}
            </span>
          }
          name="hn"
          rules={[
            { required: true, message: t("login.HN_REQUIRED") },
            {
              pattern: /^\d{2}-\d{2}-\d{6}$/,
              message: t("login.HN_INVALID"),
            },
          ]}
        >
          <Input
            placeholder={t("login.HN")}
            ref={hnInputRef}
            maxLength={12}
            className="w-full p-2 text-sm sm:text-base border rounded-md"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-sm sm:text-base font-medium text-gray-700">
              {t("login.DOB")}
            </span>
          }
          name="dob"
          rules={[{ required: true, message: t("login.DOB_REQUIRED") }]}
        >
          <DatePicker
            placeholder={t("login.DOB_PLACEHOLDER")}
            className="w-full p-2 text-sm sm:text-base border rounded-md"
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            htmlType="submit"
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t("login.SUBMIT")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;
