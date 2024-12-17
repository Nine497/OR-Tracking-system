// models/doctorModel.js

const db = require("../config/database");

const Doctor = {
  getAllDoctors: () => {
    return db("doctors").select("*");
  },

  getDoctorById: (id) => {
    return db("doctors").where("doctor_id", id).first();
  },

  createDoctor: (doctorData) => {
    return db("doctors").insert(doctorData).returning("*");
  },

  updateDoctor: (id, doctorData) => {
    return db("doctors")
      .where("doctor_id", id)
      .update(doctorData)
      .returning("*");
  },

  deleteDoctor: (id) => {
    return db("doctors").where("doctor_id", id).del();
  },
};

module.exports = Doctor;
