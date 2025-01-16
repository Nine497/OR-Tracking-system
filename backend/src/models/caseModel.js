const db = require("../config/database");

const SurgeryCase = {
  getCaseWithPatientById: (surgeryCaseId) => {
    return db("surgery_case")
      .select(
        "surgery_case.surgery_case_id",
        "surgery_case.surgery_type_id",
        "surgery_case.operating_room_id",
        "surgery_case.status_id",
        "surgery_case.doctor_id",
        "surgery_case.patient_id",
        "surgery_case.estimate_duration",
        "surgery_case.estimate_start_time",
        "surgery_case.surgery_date",
        "surgery_case.patient_history as patient_history",
        "patients.firstname as patient_firstname",
        "patients.lastname as patient_lastname",
        "patients.hn_code as patient_hn_code",
        "patients.gender as patient_gender",
        "patients.dob as patient_dob",
        "operation.operation_id",
        "operation.operation_name"
      )
      .leftJoin("patients", "surgery_case.patient_id", "patients.patient_id")
      .leftJoin(
        "operation",
        "surgery_case.surgery_case_id",
        "operation.surgery_case_id"
      )
      .where("surgery_case.surgery_case_id", surgeryCaseId)
      .first();
  },

  // ค้นหาข้อมูลกรณีการผ่าตัดตามเงื่อนไข
  findOne: (criteria) => {
    return db("surgery_case").where(criteria).first();
  },

  // ค้นหาทุกกรณีการผ่าตัด
  getAll: () => {
    return db("surgery_case")
      .select(
        "surgery_case.*",
        "patients.firstname as patient_firstname",
        "patients.lastname as patient_lastname",
        "doctors.firstname as doctor_firstname",
        "doctors.lastname as doctor_lastname",
        "operating_room.room_name as room_name",
        "status.status_name as status_name"
      )
      .leftJoin("patients", "surgery_case.patient_id", "patients.patient_id")
      .leftJoin("doctors", "surgery_case.doctor_id", "doctors.doctor_id")
      .leftJoin(
        "operating_room",
        "surgery_case.operating_room_id",
        "operating_room.operating_room_id"
      )
      .leftJoin("status", "surgery_case.status_id", "status.status_id");
  },

  getAllByOrID: (operating_room_id) => {
    return db("surgery_case")
      .select(
        "surgery_case.surgery_case_id",
        "surgery_case.operating_room_id as case_operating_room_id",
        "surgery_case.patient_id",
        "surgery_case.doctor_id",
        "surgery_case.status_id",
        "surgery_case.estimate_duration",
        "surgery_case.estimate_start_time",
        "surgery_case.surgery_date",
        "surgery_case.surgery_type_id",
        "patients.firstname as patient_firstname",
        "patients.lastname as patient_lastname",
        "patients.hn_code as patient_HN",
        "doctors.firstname as doctor_firstname",
        "doctors.lastname as doctor_lastname",
        "operating_room.room_name as room_name",
        "status.status_name as status_name",
        "surgery_type.surgery_type_name as surgery_type_name"
      )
      .leftJoin("patients", "surgery_case.patient_id", "patients.patient_id")
      .leftJoin("doctors", "surgery_case.doctor_id", "doctors.doctor_id")
      .leftJoin(
        "operating_room",
        "surgery_case.operating_room_id",
        "operating_room.operating_room_id"
      )
      .leftJoin("status", "surgery_case.status_id", "status.status_id")
      .leftJoin(
        "surgery_type",
        "surgery_case.surgery_type_id",
        "surgery_type.surgery_type_id"
      )
      .where("surgery_case.operating_room_id", operating_room_id);
  },

  // เพิ่มกรณีการผ่าตัดใหม่
  create: (surgeryCaseData) => {
    return db("surgery_case")
      .insert(surgeryCaseData)
      .returning("*")
      .then((newSurgeryCase) => newSurgeryCase[0]);
  },

  // อัปเดตข้อมูลกรณีการผ่าตัดตาม id
  update: (surgery_case_id, surgeryCaseData) => {
    return db("surgery_case")
      .where("surgery_case_id", surgery_case_id)
      .update(surgeryCaseData)
      .returning("*")
      .then((updatedSurgeryCase) => updatedSurgeryCase[0]);
  },

  // ค้นหากรณีการผ่าตัดตาม id
  findById: (id) => {
    return db("surgery_case").where("surgery_case_id", id).first();
  },

  // อัปเดตสถานะของกรณีการผ่าตัด (เช่น ควบคุมสถานะ)
  updateStatus: (id, statusId) => {
    return db("surgery_case")
      .where("surgery_case_id", id)
      .update({ status_id: statusId })
      .returning("*")
      .then((updatedSurgeryCase) => updatedSurgeryCase[0]);
  },

  // ค้นหาข้อมูลการผ่าตัดตามประเภทการผ่าตัด (join กับ surgery_type)
  getSurgeryTypeBySurgeryCaseId: (surgeryCaseId) => {
    return db("surgery_case")
      .join(
        "surgery_type",
        "surgery_case.surgery_type_id",
        "surgery_type.surgery_type_id"
      )
      .select("surgery_type.surgery_type_name", "surgery_type.description")
      .where("surgery_case.surgery_case_id", surgeryCaseId);
  },

  // ค้นหาหมอที่เกี่ยวข้องกับกรณีการผ่าตัด (join กับ doctors)
  getDoctorBySurgeryCaseId: (surgeryCaseId) => {
    return db("surgery_case")
      .join("doctors", "surgery_case.doctor_id", "doctors.doctor_id")
      .select("doctors.firstname", "doctors.lastname", "doctors.specialization")
      .where("surgery_case.surgery_case_id", surgeryCaseId);
  },

  // ค้นหาห้องผ่าตัดที่เกี่ยวข้องกับกรณีการผ่าตัด (join กับ operating_room)
  getOperatingRoomBySurgeryCaseId: (surgeryCaseId) => {
    return db("surgery_case")
      .join(
        "operating_room",
        "surgery_case.operating_room_id",
        "operating_room.operating_room_id"
      )
      .select(
        "operating_room.room_name",
        "operating_room.room_type",
        "operating_room.location"
      )
      .where("surgery_case.surgery_case_id", surgeryCaseId);
  },

  // ค้นหาผู้ป่วยที่เกี่ยวข้องกับกรณีการผ่าตัด (join กับ patients)
  getPatientBySurgeryCaseId: (surgeryCaseId) => {
    return db("surgery_case")
      .join("patients", "surgery_case.patient_id", "patients.patient_id")
      .select("patients.firstname", "patients.lastname", "patients.hn_code")
      .where("surgery_case.surgery_case_id", surgeryCaseId);
  },

  // ดึงข้อมูลหมอทั้งหมด
  getAllDoctors: () => {
    return db("doctors").select("*");
  },

  // ดึงข้อมูลห้องผ่าตัดทั้งหมด
  getAllRooms: () => {
    return db("operating_room").select("operating_room_id", "room_name");
  },

  // ดึงข้อมูลประเภทการผ่าตัดทั้งหมด
  getAllSurgeryTypes: () => {
    return db("surgery_type").select("*");
  },
};

module.exports = SurgeryCase;
