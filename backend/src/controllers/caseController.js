const SurgeryCase = require("../models/caseModel");
const db = require("../config/database");

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

// ฟังก์ชันสำหรับเพิ่มกรณีการผ่าตัดใหม่
exports.createSurgeryCase = async (req, res) => {
  const surgeryCaseData = req.body;
  try {
    const newSurgeryCase = await SurgeryCase.create(surgeryCaseData);
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
    const statusHistory = await db("surgery_case_status_history")
      .select("status_id", "updated_at")
      .where("surgery_case_id", id)
      .orderBy("updated_at", "asc");

    const latestStatus = await db("surgery_case_status_history")
      .select("status_id")
      .where("surgery_case_id", id)
      .orderBy("updated_at", "desc")
      .first();

    if (!statusHistory || !latestStatus) {
      return res.status(404).json({
        message: "No status history found for this surgery case",
      });
    }

    res.status(200).json({
      message: "Status history and latest status fetched successfully",
      statusHistory,
      latestStatus: latestStatus.status_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
