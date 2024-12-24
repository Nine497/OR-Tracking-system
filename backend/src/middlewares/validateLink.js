const patientModel = require("../models/patientModel");

const validateLinkStatus = async (req, res, next) => {
  const { patient_link } = req.body;

  if (!patient_link) {
    return res.status(400).json({
      valid: false,
      error: "NO_LINK_PROVIDED",
      message: "LINK is required",
    });
  }

  try {
    const linkStatus = await patientModel.getLinkStatusById(patient_link);

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

    req.linkStatus = linkStatus;
    next();
  } catch (error) {
    console.error("Error validating link status:", error);
    return res.status(500).json({
      valid: false,
      error: "SERVER_ERROR",
      message: "Internal server error",
    });
  }
};

module.exports = validateLinkStatus;
