import React, { useState, useRef, useEffect } from "react";
import { Form, notification, Input } from "antd";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import Logo from "../assets/Logo.png";
import { axiosInstancePatient } from "../../admin/api/axiosInstance";
import { usePatient } from "../context/PatientContext";

const PinInput = ({ length = 6, onChange, disabled }) => {
  const [pins, setPins] = useState(new Array(length).fill(""));
  const inputRefs = useRef(new Array(length).fill(null));

  useEffect(() => {
    if (disabled) {
      inputRefs.current.forEach((input) => input?.blur());
    } else {
      focusCorrectInput();
    }
  }, [disabled, pins]);

  const focusCorrectInput = () => {
    const firstEmptyIndex = pins.findIndex((pin) => pin === "");
    if (firstEmptyIndex !== -1) {
      inputRefs.current[firstEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus(); // โฟกัสช่องสุดท้ายถ้ากรอกครบ
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 1) {
      const newPins = [...pins];
      newPins[index] = value;
      setPins(newPins);
      onChange(newPins.join(""));

      focusCorrectInput();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !pins[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    const newPins = [...pins];

    pastedData.split("").forEach((value, index) => {
      if (index < length) {
        newPins[index] = value;
      }
    });

    setPins(newPins);
    onChange(newPins.join(""));
    focusCorrectInput();
  };

  return (
    <div className="flex gap-2 justify-center">
      {pins.map((pin, index) => (
        <Input
          key={index}
          type="text"
          inputMode="numeric"
          ref={(el) => (inputRefs.current[index] = el)}
          value={pin}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-2xl font-semibold 
                    border-2 rounded-lg 
                    bg-white text-black
                    dark:bg-white dark:text-black
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none 
                    transition-colors appearance-none"
          maxLength={1}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

const LoginForm = ({ t, link }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { patient_id, surgery_case_id, patient_link } = usePatient();

  const handlePinComplete = async (pin) => {
    if (pin.length === 6) {
      try {
        setLoading(true);
        setErrorMessage("");

        if (!link) {
          throw new Error(t("login.INVALID_LINK"));
        }

        const surgeryCaseResponse = await axiosInstancePatient.get(
          `link_cases/${link}`
        );

        if (!surgeryCaseResponse?.data?.surgery_case_id) {
          throw new Error(t("login.INVALID_CASE"));
        }

        const response = await axiosInstancePatient.post("patient/login", {
          pin,
          surgery_case_id: surgeryCaseResponse.data.surgery_case_id,
          link,
        });

        if (response.data.valid) {
          localStorage.setItem("token", response.data.token);
          navigate("/ptr/view");
        } else {
          setErrorMessage(t("login.FAILED"));
        }
      } catch (error) {
        console.error("Login error:", error);
        const errorMsg =
          error.response?.data?.message || error.message || t("login.FAILED");
        setErrorMessage(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white w-full">
      {/* Header */}
      <header className="w-full bg-white shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex justify-between items-center">
          <img
            src={Logo}
            alt="Hospital Logo"
            className="h-8 sm:h-10 md:h-12 w-auto transition-transform duration-200 hover:scale-105"
          />
          <LanguageSelector t={t} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div
            className="w-full max-w-3xl mx-auto
                         py-10 sm:py-12 px-6 sm:px-8 lg:px-12
                         transform transition-all duration-300"
          >
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-800 
                         mb-8 sm:mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800"
            >
              {t("login.TITLE")}
            </h1>

            <Form layout="vertical" className="w-full max-w-2xl mx-auto">
              <div className="space-y-8">
                <label
                  className="block text-base sm:text-lg font-medium text-gray-700 text-center 
                               mb-6 sm:mb-8 tracking-wide"
                >
                  {t("login.PIN")}
                </label>
                <PinInput
                  length={6}
                  onChange={handlePinComplete}
                  disabled={loading}
                />
              </div>
            </Form>

            {loading && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Processing...
                </div>
              </div>
            )}
            {errorMessage && (
              <div className="mt-8 text-center">
                <div className="mt-4 text-red-600">{errorMessage}</div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-center text-gray-600">
          <p className="text-sm sm:text-base">
            &copy; 2025 Lorem Ipsum.{" "}
            <span className="text-blue-600">All rights reserved.</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
export default LoginForm;
