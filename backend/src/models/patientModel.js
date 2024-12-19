const patient = {
  getPatientIdByCaseId: (surgery_case_id) => {
    return db("surgery_case")
      .select("patient_id")
      .where("surgery_case_id", surgery_case_id)
      .first();
  },

  getPatientDetailsByCaseId: (surgery_case_id) => {
    return db("surgery_case")
      .join("patients", "surgery_case.patient_id", "=", "patients.patient_id")
      .select("patients.hn", "patients.dob", "patients.patient_id")
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
};

module.exports = patient;
