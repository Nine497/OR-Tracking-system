import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [patient_id, setPatient_id] = useState(null);
  const [surgery_case_id, setSurgery_case_id] = useState(null);
  const [patient_link, setPatient_link] = useState(null);
  const navigate = useNavigate();

  const setPatient = (id) => {
    setPatient_id(id);
  };

  const setSurgeryCase = (id) => {
    setSurgery_case_id(id);
  };

  const setPatientLink = (link) => {
    setPatient_link(link);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = jwtDecode(token);
        console.log("Payload:", payload);
        setPatient_id(payload.patient_id || null);
        setSurgery_case_id(payload.surgery_case_id || null);
        setPatient_link(payload.link || null);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  return (
    <PatientContext.Provider
      value={{
        patient_id,
        setPatient,
        surgery_case_id,
        setSurgeryCase,
        patient_link,
        setPatientLink,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  return useContext(PatientContext);
};
