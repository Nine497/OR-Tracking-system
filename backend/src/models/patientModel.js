const db = require("../config/database");

const patient = {
  getPatientById: (patient_id) => {
    return db("patients")
      .select("patient_id", "hn_code", "firstname", "lastname", "gender")
      .where("patient_id", patient_id)
      .first();
  },

  getPatientIdByCaseId: (surgery_case_id) => {
    return db("surgery_case")
      .select("patient_id")
      .where("surgery_case_id", surgery_case_id)
      .first();
  },

  getPatientDataByHN: (hn_code) => {
    return db("patients").select("*").where("hn_code", hn_code).first();
  },

  getPatientDetailsByCaseId: (surgery_case_id, hn) => {
    return db("surgery_case")
      .join("patients", "surgery_case.patient_id", "=", "patients.patient_id")
      .select("patients.hn_code", "patients.patient_id", "patients.dob")
      .where("surgery_case.surgery_case_id", surgery_case_id)
      .first();
  },

  getLinkStatus: (surgery_case_id, token) => {
    return db("surgery_case_links")
      .select("isactive", "expiration_time")
      .where({
        surgery_case_id: surgery_case_id,
        jwt_token: token,
      })
      .first();
  },

  getLinkStatusById: (surgery_case_links_id) => {
    return db("surgery_case_links")
      .select(
        "surgery_case_id",
        "isactive",
        "expiration_time",
        "lock_until",
        "attempt_count"
      )
      .where("surgery_case_links_id", surgery_case_links_id)
      .first();
  },

  getAllStatuses: () => {
    return db("status").select("status_id", "status_name", "description");
  },

  create: (patientData) => {
    return db("patients")
      .insert(patientData)
      .returning("*")
      .then((newPatient) => newPatient[0]);
  },

  update: (patient_id, patientData) => {
    return db("patients")
      .where("patient_id", patient_id)
      .update(patientData, "*")
      .then((updatedPatient) => updatedPatient[0]);
  },
};

module.exports = patient;
