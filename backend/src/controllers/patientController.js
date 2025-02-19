const jwt = require("jsonwebtoken");
const patientModel = require("../models/patientModel");
const linkCaseModel = require("../models/linkCaseModel");
const db = require("../config/database");
const crypto = require("crypto");
require("dotenv").config();
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);

exports.validate_link = async (req, res) => {
  try {
    const { link } = req.body;
    const trimmedLink = link?.trim();

    if (!trimmedLink) {
      return res.status(400).json({
        valid: false,
        error: "NO_LINK_PROVIDED",
        message: "LINK is required",
      });
    }

    const linkData = await db("surgery_case_links")
      .join(
        "surgery_case",
        "surgery_case.surgery_case_id",
        "=",
        "surgery_case_links.surgery_case_id"
      )
      .leftJoin(
        "patients",
        "patients.patient_id",
        "=",
        "surgery_case.patient_id"
      )
      .select(
        "surgery_case_links.*",
        "surgery_case.isactive as case_active",
        "patients.patient_id"
      )
      .where("surgery_case_links_id", trimmedLink)
      .first();

    console.log("linkData", linkData);

    if (!linkData || !linkData.isactive || !linkData.case_active) {
      return res.status(403).json({
        valid: false,
        error: "LINK_INACTIVE_OR_NOT_FOUND",
        message: "Link is inactive or not found",
      });
    }

    if (dayjs().isAfter(dayjs(linkData.expiration_time))) {
      return res
        .status(403)
        .json({ valid: false, error: "LINK_EXPIRED", message: "Link expired" });
    }

    if (!linkData.patient_id) {
      return res.status(404).json({
        valid: false,
        error: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }

    return res.json({
      valid: true,
      patient_id: linkData.patient_id,
      surgery_case_id: linkData.surgery_case_id,
      linkStatus: {
        isactive: linkData.isactive,
        expirationTime: linkData.expiration_time,
        lock_until: linkData.lock_until,
        attempt_count: linkData.attempt_count,
      },
    });
  } catch (error) {
    return res.status(500).json({
      valid: false,
      error: "SERVER_ERROR",
      message: "Internal server error",
      details: { name: error.name, message: error.message },
    });
  }
};

exports.getLockUntilByLinkId = async (req, res) => {
  const { link } = req.params;
  try {
    const data = await db("surgery_case_links")
      .select("lock_until", "attempt_count")
      .where("surgery_case_links_id", link)
      .where("isactive", true)
      .first();

    if (!data) {
      return res.status(404).json({ message: "Link not found" });
    }

    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const patientData = req.body;
    console.log("patientData", patientData);

    if (
      !patientData.hn_code ||
      !patientData.firstname ||
      !patientData.lastname ||
      !patientData.gender ||
      !patientData.dob
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    console.log(patientData);

    const existingPatient = await patientModel.getPatientById(patient_id);
    if (!existingPatient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const updatedPatient = await patientModel.update(patient_id, patientData);

    return res.status(200).json({
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the patient." });
  }
};

exports.createOrUpdatePatient = async (req, res) => {
  try {
    const patientData = req.body;
    console.log("patientData", patientData);

    if (
      !patientData.hn_code ||
      !patientData.first_name ||
      !patientData.last_name ||
      !patientData.gender ||
      !patientData.dob
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    const existingPatient = await db("patients")
      .where("hn_code", patientData.hn_code)
      .first();

    if (existingPatient) {
      const updatedPatient = await db("patients")
        .where("hn_code", patientData.hn_code)
        .update({
          firstname: patientData.first_name,
          lastname: patientData.last_name,
          gender: patientData.gender,
          dob: patientData.dob,
        })
        .returning("*")
        .then((patients) => patients[0]);

      return res.status(200).json({
        message: "Patient updated successfully",
        patient: updatedPatient,
      });
    }

    const newPatient = await db("patients")
      .insert({
        hn_code: patientData.hn_code,
        firstname: patientData.first_name,
        lastname: patientData.last_name,
        gender: patientData.gender,
        dob: patientData.dob,
      })
      .returning("*")
      .then((patients) => patients[0]);

    return res.status(201).json({
      message: "Patient created successfully",
      patient: newPatient,
    });
  } catch (error) {
    console.error("Error creating or updating patient:", error);
    return res.status(500).json({
      message: "An error occurred while processing the patient data.",
    });
  }
};

exports.login = async (req, res) => {
  const { dob, surgery_case_id, link } = req.body;
  console.log("dob", dob);

  if (!dob || !surgery_case_id) {
    return res.status(400).json({
      valid: false,
      error: "NO_DOB_CASEID_PROVIDED",
      message: "DOB and CaseId are required",
    });
  }

  try {
    const linkCase = await linkCaseModel.getLatestActiveLinkCaseBySurgeryCaseId(
      surgery_case_id
    );
    if (!linkCase) {
      return res.status(404).json({
        valid: false,
        error: "LINK_CASE_NOT_FOUND",
        message: "No link case found for this surgery_case_id",
      });
    }

    let { attempt_count, lock_until } = linkCase;
    const now = dayjs().utc();

    if (lock_until && now.isBefore(dayjs.utc(lock_until))) {
      return res.status(403).json({
        valid: false,
        error: "ACCOUNT_LOCKED",
        message: "Too many incorrect attempts. Try again later.",
        lock_until,
        attempt_count,
      });
    }

    const patientDetails = await patientModel.getPatientDetailsByCaseId(
      surgery_case_id
    );
    if (!patientDetails) {
      return res.status(404).json({
        valid: false,
        error: "PATIENT_NOT_FOUND",
        message: "No patient found for this surgery_case_id",
      });
    }

    // ✅ ตรวจสอบว่า DOB ตรงกันหรือไม่
    const formattedDob = dayjs.utc(dob).format("YYYY-MM-DD");
    const patientDob = dayjs(patientDetails.dob).format("YYYY-MM-DD");

    console.log("formattedDob", formattedDob);
    console.log("patientDob", patientDob);

    if (patientDob !== formattedDob) {
      attempt_count += 1;
      let newLockUntil = null;

      if (attempt_count % 5 === 0) {
        newLockUntil = dayjs().utc().add(1, "minute").toISOString();
      }

      console.log("link", link);
      console.log("attempt_count", attempt_count, newLockUntil);
      console.log("newLockUntil", newLockUntil);

      if (newLockUntil) {
        await linkCaseModel.updateLockUntil(link, attempt_count, newLockUntil);
      } else {
        await linkCaseModel.updateAttemptCount(
          surgery_case_id,
          attempt_count,
          now.toISOString()
        );
      }

      if (attempt_count % 5 === 0) {
        return res.status(400).json({
          valid: false,
          error: "ACCOUNT_LOCKED",
          message: "Account locked. Please wait and try again.",
          attempt_count,
          lock_until: newLockUntil,
        });
      } else {
        return res.status(400).json({
          valid: false,
          error: "INVALID_DOB",
          message: "Incorrect DOB. Please try again.",
          attempt_count,
          lock_until: newLockUntil,
        });
      }
    }

    // ✅ รีเซ็ตจำนวนครั้งที่พยายามผิดพลาด
    await linkCaseModel.resetAttemptCount(link);

    // ✅ สร้าง JWT Token
    const payload = {
      patient_id: patientDetails.patient_id,
      surgery_case_id,
      link,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    return res.json({
      valid: true,
      token,
      patient_id: patientDetails.patient_id,
      message: "Patient details matched successfully",
    });
  } catch (error) {
    console.error("Error checking patient details:", error);
    return res.status(500).json({
      valid: false,
      error: "SERVER_ERROR",
      message: "An error occurred while checking patient details",
    });
  }
};

exports.getPatientDataWithHN = async (req, res) => {
  const { hn_code } = req.params;

  if (!hn_code) {
    return res.status(400).json({
      success: false,
      message: "กรุณาระบุ hn_code",
    });
  }

  try {
    const patientData = await patientModel.getPatientDataByHN(hn_code);

    if (!patientData) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบข้อมูลผู้ป่วยที่มี hn_code: ${hn_code}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: patientData,
    });
  } catch (error) {
    console.error("Error fetching patient data:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ป่วย",
    });
  }
};

exports.getPatientData = async (req, res) => {
  const { surgery_case_id } = req.body;
  console.log("surgery_case_id", surgery_case_id);

  try {
    const patientData = await db("surgery_case")
      .join("patients", "surgery_case.patient_id", "patients.patient_id")
      .join("doctors", "surgery_case.doctor_id", "doctors.doctor_id")
      .join(
        "operating_room",
        "surgery_case.operating_room_id",
        "operating_room.operating_room_id"
      )
      .join("status", "surgery_case.status_id", "status.status_id")
      .join(
        "surgery_type",
        "surgery_case.surgery_type_id",
        "surgery_type.surgery_type_id"
      )
      .select(
        "surgery_case.surgery_case_id",
        "patients.patient_id",
        "patients.hn_code",
        "patients.firstname as patient_first_name",
        "patients.lastname as patient_last_name",
        "patients.gender",
        "doctors.prefix as doctor_prefix",
        "doctors.firstname as doctor_first_name",
        "doctors.lastname as doctor_last_name",
        "operating_room.room_name",
        "operating_room.location",
        "status.status_name",
        "status.status_id",
        "status.description",
        "surgery_type.surgery_type_name",
        "surgery_case.surgery_start_time",
        "surgery_case.surgery_end_time"
      )
      .where("surgery_case.surgery_case_id", surgery_case_id)
      .first();

    if (!patientData) {
      return res.status(404).json({ message: "Case not found" });
    }

    res.status(200).json(patientData);
  } catch (error) {
    console.error("Error fetching patient data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllStatuses = async (req, res) => {
  try {
    const language_code = req.query.language_code || "en";

    const statuses = await db("status")
      .select(
        "status.status_id",
        "status.status_name",
        "status.description",
        "translations.language_code",
        "translations.translated_name",
        "translations.translated_des"
      )
      .leftJoin("translations", function () {
        this.on("translations.ref_id", "=", "status.status_id")
          .andOn("translations.section", "=", db.raw("'status'"))
          .andOn(
            "translations.language_code",
            "=",
            db.raw("?", [language_code])
          );
      })
      .orderBy("status.status_id");

    if (!statuses || statuses.length === 0) {
      return res.status(404).json({ message: "No statuses found" });
    }

    return res.json(statuses);
  } catch (error) {
    console.error("Error in getAllStatuses:", error);
    return res.status(500).json({
      message: "Failed to retrieve statuses",
      details: error.message,
    });
  }
};

exports.getCaseWithStatusHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const statusHistory = await db("surgery_case_status_history")
      .select("status_id", "surgery_case_status_history_id", "updated_at")
      .where("surgery_case_id", id)
      .orderBy("surgery_case_status_history_id", "asc");

    const latestStatus = await db("surgery_case_status_history")
      .select("surgery_case_status_history_id")
      .where("surgery_case_id", id)
      .orderBy("surgery_case_status_history_id", "desc")
      .first();

    if (!statusHistory.length || !latestStatus) {
      return res.status(404).json({
        message: "No status history found for this surgery case",
      });
    }

    res.status(200).json({
      message: "Status history and latest status fetched successfully",
      statusHistory,
      latestStatus: latestStatus.surgery_case_status_history_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
