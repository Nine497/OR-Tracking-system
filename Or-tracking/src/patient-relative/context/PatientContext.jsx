import React, { createContext, useContext, useState } from "react";

const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [patient_id, setPatient_id] = useState(null);
  const [surgery_case_id, setSurgery_case_id] = useState(null);
  const [patient_link, setPatient_link] = useState(null);
  const setPatient = (id) => {
    setPatient_id(id);
  };

  const setSurgeryCase = (id) => {
    setSurgery_case_id(id);
  };

  const setPatientLink = (link) => {
    setPatient_link(link);
  };

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
