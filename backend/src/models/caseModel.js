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
        "surgery_case.surgery_end_time",
        "surgery_case.surgery_start_time",
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
        "surgery_case.surgery_end_time",
        "surgery_case.surgery_start_time",
        "surgery_case.surgery_type_id",
        "patients.firstname as patient_firstname",
        "patients.lastname as patient_lastname",
        "patients.hn_code as patient_HN",
        "doctors.firstname as doctor_firstname",
        "doctors.lastname as doctor_lastname",
        "operating_room.room_name as room_name",
        "status.status_name as status_name",
        "surgery_type.surgery_type_name as surgery_type_name",
        "operation.operation_name as operation_name"
      )
      .leftJoin(
        "operation",
        "surgery_case.surgery_case_id",
        "operation.surgery_case_id"
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
    // .whereRaw("DATE(surgery_case.surgery_start_time) = CURRENT_DATE");
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

  // CREATE CASE API
  getSurgeryTypeByName: (opType) => {
    return db("surgery_type")
      .where("surgery_type_name", opType)
      .select("surgery_type_id")
      .first(); // ให้แน่ใจว่าใช้ .first() เพื่อคืนค่า 1 รายการ
  },

  createSurgeryType: (opType) => {
    return db("surgery_type")
      .insert({ surgery_type_name: opType })
      .returning("surgery_type_id")
      .then(([newSurgeryType]) => newSurgeryType.surgery_type_id); // ใช้ .then() เพื่อดึงค่าออกจาก Promise
  },

  getOperatingRoomByName: (roomName) => {
    return db("operating_room")
      .where("room_name", roomName)
      .select("operating_room_id")
      .first(); // ใช้ .first() เพื่อให้แน่ใจว่าได้ค่ารายการเดียว
  },

  createOperatingRoom: (roomName) => {
    return db("operating_room")
      .insert({ room_name: roomName, isactive: true })
      .returning("operating_room_id")
      .then(([newOperatingRoom]) => newOperatingRoom.operating_room_id);
  },

  getDoctorByEmpId: (empId) => {
    return db("doctors").where("emp_id", empId).select("doctor_id").first();
  },

  createDoctor: async (data) => {
    return db("doctors")
      .insert({
        firstname: data.firstname_doctor,
        lastname: data.lastname_doctor,
        prefix: data.prefix_doctor,
        emp_id: data.emp_id,
        isactive: true,
      })
      .returning("doctor_id")
      .then(([newDoctor]) => newDoctor.doctor_id);
  },

  updateDoctor: async (doctorId, data) => {
    return db("doctors")
      .where("doctor_id", doctorId)
      .update({
        firstname: data.firstname_doctor,
        lastname: data.lastname_doctor,
        prefix: data.prefix_doctor,
      })
      .returning("doctor_id")
      .then(([updateDoctor]) => updateDoctor.doctor_id);
  },

  getPatientByHnCode: (hnCode) => {
    return db("patients").where("hn_code", hnCode).select("patient_id").first();
  },

  createPatient: (data) => {
    return db("patients")
      .insert({
        hn_code: data.HN,
        firstname: data.firstname,
        lastname: data.lastname,
        gender: data.gender,
      })
      .returning("patient_id")
      .then(([newPatient]) => newPatient.patient_id);
  },

  updatePatient: (patientId, data) => {
    return db("patients")
      .where("patient_id", patientId)
      .update({
        firstname: data.firstname,
        lastname: data.lastname,
      })
      .returning("patient_id")
      .then(([updatePatient]) => updatePatient.patient_id);
  },

  getSurgeryCaseById: (opSetId) => {
    return db("surgery_case")
      .where("surgery_case_id", opSetId)
      .select("surgery_case_id")
      .first();
  },

  createSurgeryCase: async (data) => {
    console.log("data", data);

    if (!data.surgery_case_id) {
      throw new Error("surgery_case_id (op_set_id) is required");
    }

    return db("surgery_case")
      .insert({
        surgery_case_id: data.surgery_case_id,
        doctor_id: data.doctor_id,
        surgery_start_time: data.surgery_start_time,
        surgery_end_time: data.surgery_end_time,
        surgery_type_id: data.surgery_type_id,
        operating_room_id: data.operating_room_id,
        status_id: data.status_id,
        created_by: data.created_by,
        created_at: data.created_at,
        note: data.note || "",
        patient_id: data.patient_id,
      })
      .returning("surgery_case_id")
      .then(([newSurgeryCase]) => newSurgeryCase.surgery_case_id);
  },

  updateSurgeryCase: (surgeryCaseId, data) => {
    console.log(data);
    return db("surgery_case").where("surgery_case_id", surgeryCaseId).update({
      created_at: data.created_at,
      surgery_start_time: data.surgery_start_time,
      surgery_end_time: data.surgery_end_time,
      note: data.note,
      surgery_type_id: data.surgery_type_id,
      operating_room_id: data.operating_room_id,
      doctor_id: data.doctor_id,
      patient_id: data.patient_id,
    });
  },

  // ดึง Operation ID ตาม Surgery Case ID
  getOperationByCaseId: async (surgeryCaseId) => {
    return db("operation")
      .where("surgery_case_id", surgeryCaseId)
      .select("operation_id")
      .first();
  },

  // สร้าง Operation ถ้ายังไม่มี
  createOperation: async (operationName, surgeryCaseId) => {
    const [newOperation] = await db("operation")
      .insert({
        operation_name: operationName,
        surgery_case_id: surgeryCaseId,
      })
      .returning("operation_id");
    return newOperation.operation_id;
  },

  // อัปเดต Operation ถ้ามีอยู่แล้ว
  updateOperation: async (operationId, operationName) => {
    const [updatedOperation] = await db("operation")
      .where("operation_id", operationId)
      .update({
        operation_name: operationName,
      })
      .returning("operation_id");

    return updatedOperation ? updatedOperation.operation_id : null;
  },
};

module.exports = SurgeryCase;
