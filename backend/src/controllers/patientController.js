const jwt = require("jsonwebtoken");
const patientModel = require("../models/patientModel");

exports.validateToken = async (req, res) => {
  const token = req.body.token?.trim();
  console.log("Received Token:", token);

  if (!token) {
    return res.status(400).json({
      valid: false,
      error: "NO_TOKEN_PROVIDED",
      message: "Token is required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY, {
      algorithms: ["HS256"],
    });

    console.log("Decoded payload:", decoded);

    const linkStatus = await patientModel.getLinkStatus(
      decoded.surgery_case_id,
      token
    );

    if (!linkStatus) {
      return res.status(404).json({
        valid: false,
        error: "LINK_NOT_FOUND",
        message: "Link not found",
      });
    }

    if (!linkStatus.isactive) {
      return res.status(403).json({
        valid: false,
        error: "LINK_INACTIVE",
        message: "Link is inactive",
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
      decoded.surgery_case_id
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
      decoded,
      patient_id: patientData.patient_id,
      linkStatus: {
        isactive: linkStatus.isactive,
        expirationTime: expirationTime,
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        valid: false,
        error: "TOKEN_EXPIRED",
        message: "Token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        valid: false,
        error: "INVALID_TOKEN",
        message: "Invalid token",
      });
    }

    if (error.name === "NotBeforeError") {
      return res.status(401).json({
        valid: false,
        error: "TOKEN_NOT_ACTIVE",
        message: "Token not active",
      });
    }

    return res.status(401).json({
      valid: false,
      error: "VALIDATION_FAILED",
      message: "Token validation failed",
    });
  }
};

exports.checkPatientDetails = async (req, res) => {
  const { hn, dob, caseId } = req.body;

  if (!hn || !dob || !caseId) {
    return res.status(400).json({
      valid: false,
      error: "NO_HN_OR_DOB_OR_CASEID_PROVIDED",
      message: "HN, DOB, and CaseId are required",
    });
  }

  try {
    const patientDetails = await patientModel.getPatientDetailsByCaseId(
      caseId,
      hn,
      dob
    );

    if (!patientDetails) {
      return res.status(404).json({
        valid: false,
        error: "PATIENT_DETAILS_NOT_MATCH",
        message: "HN and DOB do not match with the provided CaseId",
      });
    }

    return res.json({
      valid: true,
      patient_id: patientDetails.patient_id,
      message: "Patient details matched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      valid: false,
      error: "SERVER_ERROR",
      message: "An error occurred while checking patient details",
    });
  }
};
