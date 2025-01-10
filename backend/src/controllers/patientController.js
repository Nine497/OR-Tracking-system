const jwt = require("jsonwebtoken");
const patientModel = require("../models/patientModel");
const db = require("../config/database");
require("dotenv").config();

exports.validate_link = async (req, res) => {
  const { link } = req.body;
  const trimmedLink = link?.trim().replace(/[^\w]/g, "");

  if (!trimmedLink) {
    return res.status(400).json({
      valid: false,
      error: "NO_LINK_PROVIDED",
      message: "LINK is required",
    });
  }

  try {
    const linkStatus = await patientModel.getLinkStatusById(trimmedLink);
    console.log("link : ", trimmedLink);
    console.log("linkStatus : ", linkStatus);

    if (!linkStatus || !linkStatus.isactive) {
      return res.status(403).json({
        valid: false,
        error: "LINK_INACTIVE_OR_NOT_FOUND",
        message: "Link is inactive or not found",
      });
    }

    const currentTime = new Date();
    const expirationTime = new Date(linkStatus.expiration_time);

    if (currentTime > expirationTime) {
      return res.status(403).json({
        valid: false,
        error: "LINK_EXPIRED",
        message: "Link expired",
      });
    }

    const patientData = await patientModel.getPatientIdByCaseId(
      linkStatus.surgery_case_id
    );

    if (!patientData) {
      return res.status(404).json({
        valid: false,
        error: "PATIENT_NOT_FOUND",
        message: "Patient not found",
      });
    }

    return res.json({
      valid: true,
      patient_id: patientData.patient_id,
      surgery_case_id: linkStatus.surgery_case_id,
      linkStatus: {
        isactive: linkStatus.isactive,
        expirationTime: expirationTime,
      },
    });
  } catch (error) {
    console.error("Detailed error information:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error object:", JSON.stringify(error, null, 2));

    return res.status(500).json({
      valid: false,
      error: "SERVER_ERROR",
      message: "Internal server error",
      details: {
        name: error.name,
        message: error.message,
      },
    });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const patientData = req.body;

    if (
      !patientData.hn_code ||
      !patientData.dob ||
      !patientData.first_name ||
      !patientData.last_name
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    const existingPatient = await Patient.getPatientById(patient_id);
    if (!existingPatient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const updatedPatient = await Patient.update(patient_id, patientData);

    return res.status(200).json({
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
    โ;
  } catch (error) {
    console.error("Error updating patient:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the patient." });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const patientData = req.body;

    if (
      !patientData.hn_code ||
      !patientData.dob ||
      !patientData.first_name ||
      !patientData.last_name
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    if (patientData.dob) {
      patientData.dob = moment(patientData.dob).format("YYYY-MM-DD");
    }

    const newPatient = await Patient.create(patientData);

    return res
      .status(201)
      .json({ message: "Patient created successfully", patient: newPatient });
  } catch (error) {
    console.error("Error creating patient:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while creating the patient." });
  }
};

exports.login = async (req, res) => {
  const { hn, dob, surgery_case_id, link } = req.body;

  const date = new Date(dob);
  const formattedDob = date.toLocaleDateString("en-CA");

  console.log("DOB", formattedDob);
  console.log("link", link);

  if (!hn || !formattedDob || !surgery_case_id) {
    return res.status(400).json({
      valid: false,
      error: "NO_HN_OR_DOB_OR_CASEID_PROVIDED",
      message: "HN, DOB, and CaseId are required",
    });
  }

  try {
    const patientDetails = await patientModel.getPatientDetailsByCaseId(
      surgery_case_id,
      hn,
      formattedDob
    );

    if (!patientDetails) {
      return res.status(404).json({
        valid: false,
        error: "PATIENT_DETAILS_NOT_MATCH",
        message: "Invalid HN or DOB. Please try again.",
      });
    }

    const payload = {
      patient_id: patientDetails.patient_id,
      surgery_case_id: surgery_case_id,
      link: link,
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
        "patients.dob",
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
        "surgery_case.estimate_start_time",
        "surgery_case.estimate_duration",
        "surgery_case.surgery_date"
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

exports.getAllStatuses = async () => {
  try {
    const statuses = await db("status")
      .select(
        "status.status_id",
        "status.status_name",
        "status.description",
        "translations.translated_name",
        "translations.translated_des"
      )
      .leftJoin("translations", function () {
        this.on("translations.ref_id", "=", "status.status_id")
          .andOn("translations.language_code", "=", db.raw("'th'"))
          .andOn("translations.section", "=", db.raw("'status'"));
      })
      .orderBy("status.status_id");

    if (!statuses || statuses.length === 0) {
      return { message: "No statuses found" };
    }

    return statuses;
  } catch (error) {
    console.error("Error in getAllStatuses:", error);
    return { message: "Failed to retrieve statuses", details: error.message };
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
