import React, { useState, useRef, useEffect } from "react";
import { Form, notification, Input } from "antd";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import Logo from "../assets/Logo.png";
import { axiosInstancePatient } from "../../admin/api/axiosInstance";
import { usePatient } from "../context/PatientContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
// const PinInput = ({ length = 6, onChange, disabled }) => {
//   const [pins, setPins] = useState(new Array(length).fill(""));
//   const inputRefs = useRef(new Array(length).fill(null));
//   const prevDisabledRef = useRef(disabled);

//   useEffect(() => {
//     if (disabled) {
//       inputRefs.current.forEach((input) => input?.blur());
//     } else {
//       focusCorrectInput();
//     }
//   }, [disabled, pins]);

//   useEffect(() => {
//     if (prevDisabledRef.current && !disabled) {
//       const clearedPins = new Array(length).fill("");
//       setPins(clearedPins);
//       onChange(clearedPins.join(""));
//       inputRefs.current[0]?.focus();
//     }
//     prevDisabledRef.current = disabled;
//   }, [disabled, length, onChange]);

//   const focusCorrectInput = () => {
//     const firstEmptyIndex = pins.findIndex((pin) => pin === "");
//     if (firstEmptyIndex !== -1) {
//       inputRefs.current[firstEmptyIndex]?.focus();
//     } else {
//       inputRefs.current.forEach((input) => input?.blur());
//     }
//   };

//   const handleChange = (e, index) => {
//     const value = e.target.value.replace(/\D/g, "");
//     if (value.length > 1) return;

//     const isComplete = pins.every((pin) => pin !== "");

//     if (isComplete) {
//       const newPins = new Array(length).fill("");
//       newPins[0] = value;
//       setPins(newPins);
//       onChange(newPins.join(""));
//       inputRefs.current[0]?.focus();
//       return;
//     }

//     const newPins = [...pins];
//     newPins[index] = value;
//     setPins(newPins);
//     onChange(newPins.join(""));

//     if (newPins.every((pin) => pin !== "")) {
//       const clearedPins = new Array(length).fill("");
//       setPins(clearedPins);
//       onChange(clearedPins.join(""));
//       inputRefs.current[0]?.focus();
//     } else {
//       focusCorrectInput();
//     }
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace" && !pins[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pastedData = e.clipboardData
//       .getData("text")
//       .replace(/\D/g, "")
//       .slice(0, length);
//     const newPins = new Array(length).fill("");
//     pastedData.split("").forEach((value, i) => {
//       if (i < length) {
//         newPins[i] = value;
//       }
//     });
//     setPins(newPins);
//     onChange(newPins.join(""));
//     focusCorrectInput();
//   };

//   return (
//     <div className="flex gap-2 justify-center">
//       {pins.map((pin, index) => (
//         <Input
//           key={index}
//           type="text"
//           inputMode="numeric"
//           ref={(el) => (inputRefs.current[index] = el)}
//           value={pin}
//           onChange={(e) => handleChange(e, index)}
//           onKeyDown={(e) => handleKeyDown(e, index)}
//           onPaste={handlePaste}
//           className="w-12 h-12 text-center text-2xl font-semibold border-2 rounded-lg bg-white text-black dark:bg-white dark:text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors appearance-none"
//           maxLength={1}
//           disabled={disabled}
//         />
//       ))}
//     </div>
//   );
// };

const LoginForm = ({ t, link }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dobDisable, setDobDisable] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [remainingSecond, setRemainingSecond] = useState(null);
  const navigate = useNavigate();
  const endTimeRef = useRef(null);
  const timerRef = useRef(null);
  const yearRef = useRef(null);
  const monthRef = useRef(null);
  const dayRef = useRef(null);
  const [form] = Form.useForm();
  const [patientDobData, setPatientDobData] = useState({
    patient_dob_day: "",
    patient_dob_month: "",
    patient_dob_year: "",
  });

  useEffect(() => {
    if (remainingSecond > 0) {
      startCountdown(remainingSecond);
    }
  }, [remainingSecond]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     dayRef.current?.focus();
  //   }, 100);

  //   const fetchLockUntilData = async () => {
  //     try {
  //       const response = await axiosInstancePatient.get(
  //         `patient/getLockUntilByLinkId/${link}`
  //       );
  //       const { lock_until, attempt_count } = response.data;
  //       // console.log("response", response);
  //       if (attempt_count !== undefined) {
  //         const remainder = attempt_count % 5;
  //         const remainingAttempts = 5 - remainder;
  //         // console.log("remainingAttempts", remainingAttempts);

  //         let errorMsg =
  //           remainingAttempts > 0 && remainingAttempts < 5
  //             ? `${t("login.errorMsgRemainingAttempts", { remainingAttempts })}`
  //             : null;
  //         // : `${t("login.errorMsgExceededAttempts", { attempt_count })}`;
  //         setErrorMessage(errorMsg);
  //         if (lock_until) {
  //           const parsedDate = dayjs(lock_until, "YYYY-MM-DD HH:mm:ss");
  //           if (parsedDate.isValid()) {
  //             calRemainingSeconds(parsedDate.format("MM-DD-YYYY HH:mm:ss"));
  //           } else {
  //             console.warn("Invalid date format:", lock_until);
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching lockUntil data:", error);
  //     }
  //   };

  //   fetchLockUntilData();
  // }, [link]);

  // const calRemainingSeconds = (lock_until) => {
  //   setLoading(true);

  //   const lockTime = dayjs.utc(lock_until).tz("Asia/Bangkok");
  //   const currentTime = dayjs().tz("Asia/Bangkok");

  //   console.log("lockTime", lockTime.format("DD/MM/YYYY HH:mm:ss"));
  //   console.log("currentTime", currentTime.format("DD/MM/YYYY HH:mm:ss"));

  //   const remainingSeconds = lockTime.diff(currentTime, "second");
  //   setRemainingSecond(remainingSeconds);
  //   console.log("remainingSeconds", remainingSeconds);

  //   if (remainingSeconds > 0) {
  //     startCountdown(remainingSeconds);
  //   }

  //   setLoading(false);
  // };

  // Start countdown timer
  const startCountdown = (remainingSeconds) => {
    if (remainingSeconds <= 0) {
      setCountdown(null);
      setDobDisable(false);

      setTimeout(() => {
        // console.log("Focusing day input after countdown:", dayRef.current);
        dayRef.current?.focus();
      }, 100);
      return;
    }

    setDobDisable(true);
    setCountdown(remainingSeconds);
    endTimeRef.current = dayjs().add(remainingSeconds, "second").valueOf();

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const now = dayjs().valueOf();
      const remaining = Math.max(
        Math.round((endTimeRef.current - now) / 1000),
        0
      );

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setCountdown(null);
        setDobDisable(false);

        setTimeout(() => {
          console.log("Focusing day input after countdown:", dayRef.current);
          dayRef.current?.focus();
        }, 100);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  };

  useEffect(() => {
    setTimeout(() => {
      console.log("Focusing day input after countdown:", dayRef.current);
      dayRef.current?.focus();
    }, 100);
  }, [link]);

  // const handleDobComplete = async () => {
  //   const { patient_dob_day, patient_dob_month, patient_dob_year } =
  //     patientDobData || {};

  //   const dob = `${patient_dob_year}-${patient_dob_month}-${patient_dob_day}`;

  //   try {
  //     setLoading(true);
  //     setErrorMessage("");

  //     if (!link) {
  //       throw new Error(t("login.INVALID_LINK"));
  //     }

  //     const surgeryCaseResponse = await axiosInstancePatient.get(
  //       `link_cases/${link}`
  //     );
  //     if (!surgeryCaseResponse?.data?.surgery_case_id) {
  //       throw new Error(t("login.INVALID_CASE"));
  //     }

  //     const response = await axiosInstancePatient.post("patient/login", {
  //       dob,
  //       surgery_case_id: surgeryCaseResponse.data.surgery_case_id,
  //       link,
  //     });
  //     console.log("response", response);

  //     if (response.data.valid) {
  //       localStorage.setItem("token", response.data.token);
  //       navigate(`/ptr/view?link=${link}`);
  //     } else {
  //       console.log("login failed");

  //       setErrorMessage(t("login.FAILED"));
  //     }
  //   } catch (error) {
  //     console.error("Login error:", error);

  //     const attempt_count = error.response?.data?.attempt_count;
  //     const lock_until = error.response?.data?.lock_until;

  //     if (error.response?.data?.error === "ACCOUNT_LOCKED") {
  //       console.log("lock_until", lock_until);
  //       const parsedDate = dayjs(lock_until, "YYYY-MM-DD HH:mm:ss");
  //       console.log("parsedDate", parsedDate);
  //       if (parsedDate) {
  //         console.log("calRemainingSeconds");
  //         calRemainingSeconds(parsedDate.format("MM-DD-YYYY HH:mm:ss"));
  //       }
  //     } else if (attempt_count !== undefined) {
  //       const remainder = attempt_count % 5;
  //       const remainingAttempts = 5 - remainder;

  //       setPatientDobData({
  //         patient_dob_day: "",
  //         patient_dob_month: "",
  //         patient_dob_year: "",
  //       });
  //       form.setFieldsValue({
  //         patient_dob_day: "",
  //         patient_dob_month: "",
  //         patient_dob_year: "",
  //       });
  //       let errorMsg = "";
  //       if (remainingAttempts > 0 && remainingAttempts < 5) {
  //         console.log("remainingAttempts", remainingAttempts);
  //         errorMsg = `${t("login.errorMsgRemainingAttempts", {
  //           remainingAttempts,
  //         })}`;

  //         setTimeout(() => {
  //           dayRef.current?.focus();
  //         }, 100);
  //       }
  //       // } else if (remainingAttempts === 5) {
  //       //   const parsedDate = dayjs(lock_until, "YYYY-MM-DD HH:mm:ss.SSS");
  //       //   if (parsedDate.isValid()) {
  //       //     console.log("Call calRemainingSeconds");
  //       //     calRemainingSeconds(parsedDate.format("MM-DD-YYYY HH:mm:ss"));
  //       //   }
  //       // }

  //       setErrorMessage(errorMsg);
  //     } else {
  //       setErrorMessage(t("login.errorMsgUnknown"));
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleDobComplete = async () => {
    const { patient_dob_day, patient_dob_month, patient_dob_year } =
      patientDobData || {};

    const dob = `${patient_dob_year}-${patient_dob_month}-${patient_dob_day}`;

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
        dob,
        surgery_case_id: surgeryCaseResponse.data.surgery_case_id,
        link,
      });
      // console.log("response", response);

      if (response.data.valid) {
        localStorage.setItem("token", response.data.token);
        navigate(`/ptr/view?link=${link}`);
      } else {
        // console.log("login failed");

        setErrorMessage(t("login.FAILED"));
      }
    } catch (error) {
      console.error("Login error:", error);

      const attempt_count = error.response?.data?.attempt_count;
      if (attempt_count !== undefined) {
        const remainder = attempt_count % 5;
        const remainingAttempts = 5 - remainder;

        setPatientDobData({
          patient_dob_day: "",
          patient_dob_month: "",
          patient_dob_year: "",
        });
        form.setFieldsValue({
          patient_dob_day: "",
          patient_dob_month: "",
          patient_dob_year: "",
        });
        let errorMsg = "";
        errorMsg = `${t("login.errorMsgLoginFailed")}`;

        setTimeout(() => {
          dayRef.current?.focus();
        }, 100);
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage(t("login.errorMsgUnknown"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { patient_dob_day, patient_dob_month, patient_dob_year } =
      patientDobData;

    if (
      patient_dob_day.length === 2 &&
      patient_dob_month.length === 2 &&
      patient_dob_year.length === 4
    ) {
      handleDobComplete();
    }
  }, [patientDobData]);

  const handlePatientDobChange = (field, value) => {
    setPatientDobData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    form.setFieldsValue({
      [field]: value,
    });

    if (
      field === "patient_dob_day" &&
      (value.length === 2 || (value >= 4 && value <= 9))
    ) {
      monthRef.current?.focus();
    }

    if (
      field === "patient_dob_month" &&
      (value.length === 2 || (value >= 2 && value <= 9))
    ) {
      yearRef.current?.focus();
    }
  };

  // useEffect(() => {
  //   console.log("Updated patientDobData:", patientDobData);
  // }, [patientDobData]);
  //   if (pin.length === 6) {
  //     try {
  //       setLoading(true);
  //       setErrorMessage("");

  //       if (!link) {
  //         throw new Error(t("login.INVALID_LINK"));
  //       }

  //       const surgeryCaseResponse = await axiosInstancePatient.get(
  //         `link_cases/${link}`
  //       );
  //       if (!surgeryCaseResponse?.data?.surgery_case_id) {
  //         throw new Error(t("login.INVALID_CASE"));
  //       }

  //       const response = await axiosInstancePatient.post("patient/login", {
  //         pin,
  //         surgery_case_id: surgeryCaseResponse.data.surgery_case_id,
  //         link,
  //       });

  //       if (response.data.valid) {
  //         // console.log("link", link);
  //         localStorage.setItem("token", response.data.token);
  //         navigate(`/ptr/view?link=${link}`);
  //       } else {
  //         setErrorMessage(t("login.FAILED"));
  //       }
  //     } catch (error) {
  //       console.error("Login error:", error);

  //       const errorAttemptCount = error.response?.data?.attempt_count;
  //       const lockData = error.response?.data?.lock_until[0].lock_until;
  //       // console.log("lockData", lockData);

  //       if (error.response?.data?.error === "ACCOUNT_LOCKED") {
  //         const parsedDate = dayjs(lockData, "YYYY-MM-DD HH:mm:ss.SSS");
  //         if (parsedDate.isValid()) {
  //           calRemainingSeconds(parsedDate.format("MM-DD-YYYY HH:mm:ss"));
  //         }

  //         // const remainingSeconds = lockData
  //         //   ? dayjs(lockData).diff(dayjs(), "second")
  //         //   : 0;
  //         // console.log("remainingSeconds", remainingSeconds);

  //         // startCountdown(remainingSeconds);
  //       } else if (errorAttemptCount !== undefined) {
  //         const remainder = errorAttemptCount % 5;
  //         const remainingAttempts = 5 - remainder;

  //         let errorMsg = "";
  //         if (remainingAttempts > 0 && remainingAttempts < 5) {
  //           errorMsg = `${t("login.errorMsgRemainingAttempts", {
  //             remainingAttempts,
  //           })}`;
  //         } else if (remainingAttempts === 5) {
  //           const parsedDate = dayjs(lockData, "YYYY-MM-DD HH:mm:ss.SSS");
  //           if (parsedDate.isValid()) {
  //             calRemainingSeconds(parsedDate.format("MM-DD-YYYY HH:mm:ss"));
  //           }

  //           // const remainingSeconds = lockData
  //           //   ? dayjs(lockData).diff(dayjs(), "second")
  //           //   : 0;
  //           // console.log("remainingSeconds", remainingSeconds);

  //           // startCountdown(remainingSeconds);
  //         }

  //         setErrorMessage(errorMsg);
  //       } else {
  //         setErrorMessage(t("login.errorMsgUnknown"));
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white w-full">
      {/* Header */}
      <header className="w-full bg-white">
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
          <div className="w-full max-w-3xl mx-auto py-10 sm:py-12 px-6 sm:px-8 lg:px-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              {t("login.TITLE")}
            </h1>

            <Form
              form={form}
              layout="vertical"
              className="w-full max-w-2xl mx-auto"
            >
              <div className="space-y-8">
                <label className="block text-base sm:text-lg font-medium text-gray-700 text-center mb-6 sm:mb-8 tracking-wide">
                  {t("login.DOB_PLACEHOLDER")}
                </label>
                {/* <PinInput
                  length={6}
                  onChange={handlePinComplete}
                  disabled={loading || setDobDisable}
                /> */}

                <Form.Item
                  required
                  rules={[
                    {
                      required: true,
                      message: `${t("login.errorMsgAllFieldRequired")}`,
                    },
                  ]}
                >
                  <Input.Group className="flex">
                    <Form.Item
                      value={patientDobData.patient_dob_day}
                      name="patient_dob_day"
                      noStyle
                      rules={[
                        {
                          required: true,
                          message: `${t("login.errorMsgRequiredDay")}`,
                        },
                      ]}
                    >
                      <Input
                        inputMode="numeric"
                        disabled={loading || dobDisable}
                        ref={dayRef}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (!isNaN(value) && value <= 31) {
                            handlePatientDobChange("patient_dob_day", value);
                          }
                        }}
                        placeholder="DD"
                        className="h-11 text-base rounded-lg w-20 text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        maxLength={2}
                        onBlur={(e) => {
                          let value = e.target.value;

                          let numValue = parseInt(value, 10);

                          if (numValue < 10 && value.length === 1) {
                            value = `0${numValue}`;
                          }

                          if (numValue > 31) {
                            value = "31";
                          }

                          handlePatientDobChange("patient_dob_day", value);
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="patient_dob_month"
                      noStyle
                      rules={[
                        {
                          required: true,
                          message: `${t("login.errorMsgRequiredMonth")}`,
                        },
                        // {
                        //   validator: (_, value) => {
                        //     if (!value || (value >= 1 && value <= 12)) {
                        //       return Promise.resolve();
                        //     }
                        //     return Promise.reject(
                        //       "กรุณากรอกเดือนที่อยู่ในช่วง 1-12"
                        //     );
                        //   },
                        // },
                      ]}
                    >
                      <Input
                        inputMode="numeric"
                        disabled={loading || dobDisable}
                        value={patientDobData.patient_dob_month}
                        ref={monthRef}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (!isNaN(value) && value >= 1 && value <= 12) {
                            handlePatientDobChange("patient_dob_month", value);
                          }
                        }}
                        placeholder="MM"
                        className="h-11 text-base rounded-lg w-20 text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        maxLength={2}
                        onBlur={(e) => {
                          let value = e.target.value;
                          let numValue = parseInt(value, 10);

                          if (numValue < 10 && value.length === 1) {
                            value = `0${value}`;
                          }
                          if (numValue > 12) {
                            value = "12";
                          }
                          handlePatientDobChange("patient_dob_month", value);
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="patient_dob_year"
                      noStyle
                      rules={[
                        {
                          required: true,
                          message: `${t("login.errorMsgRequiredYear")}`,
                        },
                        {
                          pattern: /^\d{4}$/,
                          message: `${t("login.errorMsgYearFormat")}`,
                        },
                      ]}
                    >
                      <Input
                        inputMode="numeric"
                        disabled={loading || dobDisable}
                        value={patientDobData.patient_dob_year}
                        ref={yearRef}
                        onChange={(e) =>
                          handlePatientDobChange(
                            "patient_dob_year",
                            e.target.value
                          )
                        }
                        placeholder="YYYY"
                        className="h-11 text-base rounded-lg w-24 text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        maxLength={4}
                      />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
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

            {/* {dobDisable && countdown !== null && !isNaN(countdown) && (
              <div className="mt-4 text-center text-gray-700">
                <p>
                  {t("login.waitForPin", {
                    minutes: Math.floor(countdown / 60) || 0,
                    seconds: countdown % 60 || 0,
                  })
                    .split("\n")
                    .map((text, index) => (
                      <React.Fragment key={index}>
                        {text}
                        <br />
                      </React.Fragment>
                    ))}
                </p>
              </div>
            )} */}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-center text-gray-600">
          <p className="text-sm sm:text-base">
            &copy; {dayjs().format("YYYY")} Bangkok Hospital Hat Yai.
          </p>
          <p className="text-blue-600">All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LoginForm;
