import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AccessLinkError from "../page/accessLinkError";
import { usePatient } from "./PatientContext";
import axiosInstance from "../../admin/api/axiosInstance";
import FullScreenLoading from "../components/FullScreenLoading";

const PatientRoute = ({ children }) => {
  const { patient_link, patient_id } = usePatient();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return true;
    }
  };

  useEffect(() => {
    const checkTokenAndLink = async () => {
      const token = localStorage.getItem("token");

      if (!token || isTokenExpired(token)) {
        setErrorMessage("Your session has expired. Please login again.");
        localStorage.removeItem("token");
        setIsLoading(false);
        navigate(patient_link ? `/ptr?link=${patient_link}` : "/login");
        return;
      }

      if (!patient_link || !patient_id) {
        console.log("Waiting for patient_link and patient_id...");
        setIsLoading(true);
        return;
      }

      try {
        const response = await axiosInstance.post(`patient/validate_link`, {
          link: patient_link,
        });
        console.log("Response: ", response);

        if (!response.data.valid) {
          if (response.data.error === "LINK_EXPIRED") {
            setErrorMessage("Link expired. Please request a new link.");
          } else {
            setErrorMessage(response.data.message || "Invalid link.");
          }
        }
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to validate the link. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (patient_link && patient_id) {
      setIsLoading(true);
      checkTokenAndLink();
    }
  }, [patient_link, patient_id, navigate]);

  if (isLoading) {
    return null;
  }

  if (errorMessage) {
    return <AccessLinkError errorMessage={errorMessage} />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PatientRoute;
