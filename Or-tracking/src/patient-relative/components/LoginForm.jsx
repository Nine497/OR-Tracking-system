import React, { useEffect, useState, useRef } from "react";
import { Form, Input, Button, notification } from "antd";
import IMask from "imask";
import Logo from "../assets/Logo.png";
import { axiosInstancePatient } from "../../admin/api/axiosInstance";
import { usePatient } from "../context/PatientContext";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import { Icon } from "@iconify/react";

const LoginForm = ({ t, link }) => {
  const [loading, setLoading] = useState(false);
  const pinInputRef = useRef(null);
  const { surgery_case_id, setPatient, setSurgeryCase } = usePatient();
  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { pin, dob_day, dob_month, dob_year } = values;
      const patient_link = link;
      const dob = `${dob_year}-${dob_month}-${dob_day}`;

      console.log("pin", pin);
      console.log("patient_link", patient_link);
      console.log("dob", dob);

      const surgeryCaseResponse = await axiosInstancePatient.get(
        `link_cases/${patient_link}`
      );
      const surgery_case_id = surgeryCaseResponse?.data?.surgery_case_id;

      if (!surgery_case_id) {
        throw new Error(t("login.INVALID_CASE"));
      }

      const response = await axiosInstancePatient.post("patient/login", {
        pin,
        dob,
        surgery_case_id,
        link: patient_link,
      });

      if (response.data.valid) {
        localStorage.setItem("token", response.data.token);
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
    if (pinInputRef.current) {
      IMask(pinInputRef.current.input, {
        mask: "000000", // Mask สำหรับ 6 หลัก
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 flex justify-end">
          <LanguageSelector t={t} />
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow w-full flex items-center justify-center py-8">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-8 text-center">
            <img
              src={Logo}
              className="w-40 sm:w-48 md:w-56 mx-auto"
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
                  {t("login.PIN")}
                </span>
              }
              name="pin"
              rules={[
                { required: true, message: t("login.PIN_REQUIRED") },
                {
                  pattern: /^\d{6}$/,
                  message: t("login.PIN_INVALID"),
                },
              ]}
            >
              <Input
                placeholder={t("login.PIN")}
                ref={pinInputRef}
                maxLength={6}
                className="w-full p-2 text-sm sm:text-base border rounded-md"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                size="large"
                htmlType="submit"
                className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base font-medium rounded-md shadow-lg transition-all duration-300"
                disabled={loading}
                icon={<Icon icon="mdi:check-circle" />}
              >
                {loading ? t("login.LOADING") : t("login.VERIFY")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center text-gray-600">
          <p className="text-sm mt-2">
            Lorem ipsum dolor sit amet, consectetur.
          </p>
          <p className="text-xs mt-2">
            © 2025 Lorem ipsum dolor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginForm;
