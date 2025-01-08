const SurgeryCase = require("../models/caseModel");
const db = require("../config/database");
const patient = require("../models/caseModel");

// ฟังก์ชันสำหรับดึงข้อมูลกรณีการผ่าตัดทั้งหมด
exports.getAllCase = async (req, res) => {
  try {
    const { search, doctor_id, limit = 6, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const lowerSearch = search ? search.trim().toLowerCase() : null;

    console.log("SEARCH : ", search);
    console.log("Doctor : ", doctor_id);

    const addSearchConditions = (query) => {
      if (doctor_id) {
        query.where("surgery_case.doctor_id", doctor_id);
      }

      if (lowerSearch) {
        query.andWhere((builder) => {
          builder
            .whereRaw('LOWER(CAST("surgery_case_id" AS text)) LIKE ?', [
              `%${lowerSearch}%`,
            ])
            .orWhereRaw("LOWER(patients.firstname) LIKE ?", [
              `%${lowerSearch}%`,
            ])
            .orWhereRaw("LOWER(patients.hn_code) LIKE ?", [`${lowerSearch}%`])
            .orWhereRaw("LOWER(operating_room.room_name) LIKE ?", [
              `%${lowerSearch}%`,
            ]);
        });
      }
    };

    const totalRecords = await db("surgery_case")
      .count("* as total")
      .first()
      .then((result) => parseInt(result.total));

    let query = db("surgery_case")
      .select(
        "surgery_case.*",
        "patients.firstname as patient_firstname",
        "patients.lastname as patient_lastname",
        "patients.hn_code as hn_code",
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

    addSearchConditions(query);

    const filteredCountQuery = query.clone();
    const filteredCount = await filteredCountQuery
      .clearSelect()
      .count("surgery_case.surgery_case_id as count")
      .first()
      .then((result) => parseInt(result.count));

    const surgeryCases = await query
      .orderBy("surgery_case.surgery_case_id", "asc")
      .limit(Number(limit))
      .offset(offset);

    res.status(200).json({
      data: surgeryCases,
      totalRecords,
      filteredCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ฟังก์ชันสำหรับค้นหากรณีการผ่าตัดตาม id
exports.getCaseById = async (req, res) => {
  const { id } = req.params;
  try {
    const surgeryCase = await SurgeryCase.findById(id);
    if (!surgeryCase) {
      return res.status(404).json({
        message: "Surgery case not found",
      });
    }
    res.status(200).json({
      message: "Surgery case fetched successfully",
      data: surgeryCase,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.createSurgeryCase = async (req, res) => {
  const surgeryCaseData = req.body;

  const patientData = {
    hn_code: surgeryCaseData.hn_code,
    firstname: surgeryCaseData.firstName,
    lastname: surgeryCaseData.lastName,
    dob: surgeryCaseData.dob,
    gender: surgeryCaseData.gender,
    patient_history: surgeryCaseData.patient_history,
  };

  try {
    if (
      !patientData.hn_code ||
      !patientData.firstname ||
      !patientData.lastname
    ) {
      return res
        .status(400)
        .json({ message: "Missing required patient details" });
    }

    let existingPatient = await db("patients")
      .where("hn_code", patientData.hn_code)
      .first();

    if (!existingPatient) {
      const newPatient = await db("patients")
        .insert(patientData)
        .returning("*")
        .then((newPatient) => newPatient[0]);
      surgeryCaseData.patient_id = newPatient.patient_id;
    } else {
      surgeryCaseData.patient_id = existingPatient.patient_id;
    }

    const newSurgeryCase = await db("surgery_case")
      .insert({
        doctor_id: surgeryCaseData.doctor_id,
        surgery_date: surgeryCaseData.surgery_date,
        estimate_start_time: surgeryCaseData.estimate_start_time,
        estimate_duration: surgeryCaseData.estimate_duration,
        surgery_type_id: surgeryCaseData.surgery_type_id,
        operating_room_id: surgeryCaseData.operating_room_id,
        status_id: surgeryCaseData.status_id,
        created_by: surgeryCaseData.created_by,
        patient_id: surgeryCaseData.patient_id,
        created_at: new Date().toISOString(),
      })
      .returning("*")
      .then((newSurgeryCase) => newSurgeryCase[0]);

    res.status(201).json({
      message: "Surgery case created successfully",
      data: newSurgeryCase,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ฟังก์ชันสำหรับอัปเดตข้อมูลกรณีการผ่าตัด
exports.updateSurgeryCase = async (req, res) => {
  const { id } = req.params;
  const surgeryCaseData = req.body;
  try {
    const updatedSurgeryCase = await SurgeryCase.update(id, surgeryCaseData);
    if (!updatedSurgeryCase) {
      return res.status(404).json({
        message: "Surgery case not found",
      });
    }
    res.status(200).json({
      message: "Surgery case updated successfully",
      data: updatedSurgeryCase,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ฟังก์ชันสำหรับอัปเดตสถานะของกรณีการผ่าตัดตาม ID
exports.updateStatusById = async (req, res) => {
  const { status_id, updatedBy } = req.body;
  const { id } = req.params;

  if (!status_id) {
    return res.status(400).json({
      message: "status_id is required",
    });
  }

  try {
    await db.transaction(async (trx) => {
      const result = await trx("surgery_case")
        .where("surgery_case_id", id)
        .update({ status_id });

      if (result === 0) {
        throw new Error("Surgery case not found");
      }

      await trx("surgery_case_status_history").insert({
        surgery_case_id: id,
        status_id,
        updated_at: new Date(),
        updated_by: updatedBy,
      });
    });

    res.status(200).json({
      message: "Surgery case status updated successfully",
    });
  } catch (err) {
    console.error(err);

    if (err.message === "Surgery case not found") {
      return res.status(404).json({
        message: err.message,
      });
    }

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getCaseWithStatusHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const statusHistory = await db("surgery_case_status_history as sch")
      .select(
        "sch.status_id",
        "sch.updated_at",
        "sch.updated_by",
        "staff.staff_id",
        "staff.firstname as staff_firstname",
        "staff.lastname as staff_lastname"
      )
      .leftJoin("staff", "sch.updated_by", "staff.staff_id")
      .where("sch.surgery_case_id", id)
      .orderBy("sch.updated_at", "asc");

    const latestStatus = await db("surgery_case_status_history as sch")
      .select("sch.status_id")
      .where("sch.surgery_case_id", id)
      .orderBy("sch.updated_at", "desc")
      .first();

    if (!statusHistory.length && !latestStatus) {
      return res.status(200).json({
        message:
          "No status history found for this surgery case. This is a new case.",
        statusHistory: [],
        latestStatus: null,
      });
    }

    res.status(200).json({
      message: "Status history and latest status fetched successfully",
      statusHistory,
      latestStatus: latestStatus ? latestStatus.status_id : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getAllSurgeryTypes = async (req, res) => {
  try {
    const surgeryTypes = await SurgeryCase.getAllSurgeryTypes();
    res.status(200).json({
      message: "Surgery types retrieved successfully",
      data: surgeryTypes,
    });
  } catch (error) {
    console.error("Error fetching surgery types:", error);
    res.status(500).json({
      message: "Server error while fetching surgery types",
      error: error.message,
    });
  }
};
