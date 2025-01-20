import React, { useEffect, useState } from "react";
import { Form, Input, Button, notification } from "antd";
import IMask from "imask";
import Logo from "../assets/Logo.png";
import { axiosInstancePatient } from "../../admin/api/axiosInstance";
import { usePatient } from "../context/PatientContext";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ t, link }) => {
  const [loading, setLoading] = useState(false);
  const hnInputRef = React.useRef(null);
  const dobInputRef = React.useRef(null);
  const { surgery_case_id, setPatient, setSurgeryCase } = usePatient();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { hn, dob_day, dob_month, dob_year } = values;
      const patient_link = link;
      const dob = `${dob_year}-${dob_month}-${dob_day}`;

      console.log("hn", hn);
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
        hn,
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
                <span className="text-base font-medium text-gray-700">
                  {t("login.DOB")}
                </span>
              }
            >
              <Input.Group className="flex">
                {/* ช่องวัน */}
                <Form.Item
                  name="dob_day"
                  rules={[
                    { required: true, message: t("login.DOB_DAY_REQUIRED") },
                    {
                      pattern: /^\d{2}$/,
                      message: t("login.DOB_DAY_INVALID"),
                    },
                  ]}
                  noStyle
                >
                  <Input
                    type="number"
                    placeholder="DD"
                    maxLength={2}
                    className="h-11 w-20 text-center text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </Form.Item>
                {/* ช่องเดือน */}
                <Form.Item
                  name="dob_month"
                  rules={[
                    { required: true, message: t("login.DOB_MONTH_REQUIRED") },
                    {
                      pattern: /^\d{2}$/,
                      message: t("login.DOB_MONTH_INVALID"),
                    },
                  ]}
                  noStyle
                >
                  <Input
                    type="number"
                    placeholder="MM"
                    maxLength={2}
                    className="h-11 w-20 text-center text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </Form.Item>

                {/* ช่องปี */}
                <Form.Item
                  name="dob_year"
                  rules={[
                    { required: true, message: t("login.DOB_YEAR_REQUIRED") },
                    {
                      pattern: /^\d{4}$/,
                      message: t("login.DOB_YEAR_INVALID"),
                    },
                  ]}
                  noStyle
                >
                  <Input
                    type="number"
                    placeholder="YYYY"
                    maxLength={4}
                    className="h-11 w-28 text-center text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </Form.Item>
              </Input.Group>
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
            Lorem ipsum dolor sit amet, consectetur.
          </p>
          <p className="text-xs mt-4">
            © 2025 Lorem ipsum dolor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginForm;
