import React, { useEffect, useState } from "react";
import { Form, Input, Button, notification } from "antd";
import IMask from "imask";
import Logo from "../assets/Logo.png";
import axiosInstance from "../../admin/api/axiosInstance";
import { usePatient } from "../context/PatientContext";
import { useNavigate } from "react-router-dom";
import { Footer } from "antd/es/layout/layout";

const LoginForm = ({ t, link }) => {
  const [loading, setLoading] = useState(false);
  const hnInputRef = React.useRef(null);
  const dobInputRef = React.useRef(null);
  const { surgery_case_id, setPatient, setSurgeryCase } = usePatient();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { hn, dob } = values;
      const patient_link = link;
      const [day, month, year] = dob.split("/");
      const formattedDob = `${year}-${month}-${day}`;

      const response = await axiosInstance.post("patient/login", {
        hn,
        dob: formattedDob,
        surgery_case_id,
        link: patient_link,
      });

      if (response.data.valid) {
        localStorage.setItem("token", response.data.token);
        notification.success({ message: t("login.SUCCESS") });
        navigate("/ptr/view");
      } else {
        notification.error({ message: t("login.FAILED") });
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || t("login.FAILED");
      notification.error({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hnInputRef.current) {
      IMask(hnInputRef.current.input, {
        mask: "00-00-000000",
      });
    }
    if (dobInputRef.current) {
      IMask(dobInputRef.current.input, {
        mask: "00/00/0000",
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* เนื้อหาหลัก */}
      <div className="flex-grow w-full flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center mb-6 text-blue-800">
            {t("login.TITLE")}
          </h2>
          <div className="mb-8">
            <img
              src={Logo}
              className="w-40 sm:w-32 md:w-64 mx-auto"
              alt="Hospital Logo"
            />
          </div>

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
              rules={[
                { required: true, message: t("login.DOB_REQUIRED") },
                {
                  pattern: /^\d{2}\/\d{2}\/\d{4}$/,
                  message: t("login.DOB_INVALID"),
                },
              ]}
            >
              <Input
                placeholder={t("login.DOB_PLACEHOLDER")}
                ref={dobInputRef}
                maxLength={10}
                className="w-full p-2 text-sm sm:text-base border rounded-md"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                htmlType="submit"
                className="w-full p-4 bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base font-medium rounded-md shadow-lg transition-all duration-300"
                disabled={loading}
              >
                {loading ? t("login.LOADING") : t("login.SUBMIT")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white mt-auto py-4">
        <div className="text-center text-gray-600">
          <p className="text-sm mt-2">
            Your health and well-being are our top priority.
          </p>
          <p className="text-xs mt-4">
            © 2025 Hospital Name. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginForm;
