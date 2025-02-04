const SurgeryCase = require("../models/caseModel");
const db = require("../config/database");
const crypto = require("crypto");
const SECRET_KEY = process.env.SECRET_KEY;
const IV = process.env.IV;
require("dotenv").config();

exports.newSurgerycaseFromAPI = async (req, res) => {
  const surgeryCaseData = req.body;
  let errors = [];

  try {
    await Promise.all(
      surgeryCaseData.map(async (data) => {
        try {
          const existingSurgeryType = await SurgeryCase.getSurgeryTypeByName(
            data.op_type
          );
          let surgeryTypeId = existingSurgeryType
            ? existingSurgeryType.surgery_type_id
            : await SurgeryCase.createSurgeryType(data.op_type);

          const existingOperatingRoom =
            await SurgeryCase.getOperatingRoomByName(data.room);
          let operatingRoomId = existingOperatingRoom
            ? existingOperatingRoom.operating_room_id
            : await SurgeryCase.createOperatingRoom(data.room);

          const existingDoctor = await SurgeryCase.getDoctorByEmpId(
            data.emp_id
          );
          let doctorId = existingDoctor
            ? await SurgeryCase.updateDoctor(existingDoctor.doctor_id, data)
            : await SurgeryCase.createDoctor(data);

          const existingPatient = await SurgeryCase.getPatientByHnCode(data.HN);
          let patientId = existingPatient
            ? await SurgeryCase.updatePatient(existingPatient.patient_id, data)
            : await SurgeryCase.createPatient(data);
          if (doctorId) {
            console.log("data.op_set_id", data.op_set_id);
          }

          const existingSurgeryCase = await SurgeryCase.getSurgeryCaseById(
            data.op_set_id
          );
          let surgeryCaseId;

          if (existingSurgeryCase) {
            await SurgeryCase.updateSurgeryCase(
              existingSurgeryCase.surgery_case_id,
              {
                doctor_id: doctorId,
                surgery_type_id: surgeryTypeId,
                operating_room_id: operatingRoomId,
                patient_id: patientId,
                status_id: data?.status_id || 0,
                created_by: data?.created_by || 1,
                created_at: data.set_datetime,
                note: data.note,
                surgery_start_time: data.op_datetime,
                surgery_end_time: data.estimate_finish,
              }
            );

            surgeryCaseId = existingSurgeryCase.surgery_case_id;
          } else {
            surgeryCaseId = await SurgeryCase.createSurgeryCase({
              surgery_case_id: data.op_set_id,
              doctor_id: doctorId,
              surgery_type_id: surgeryTypeId,
              operating_room_id: operatingRoomId,
              patient_id: patientId,
              status_id: data?.status_id || 0,
              created_by: data?.created_by || 1,
              created_at: data.set_datetime,
              note: data.note,
              surgery_start_time: data.op_datetime,
              surgery_end_time: data.estimate_finish,
            });

            await db("surgery_case_status_history").insert({
              surgery_case_id: surgeryCaseId,
              status_id: 0,
              updated_at: new Date().toISOString(),
              updated_by: data?.created_by || 1,
            });
          }

          const existingOperation = await SurgeryCase.getOperationByCaseId(
            surgeryCaseId
          );

          let operationId;
          if (existingOperation) {
            operationId = await SurgeryCase.updateOperation(
              existingOperation.operation_id,
              data.operation
            );
          } else {
            operationId = await SurgeryCase.createOperation(
              data.operation,
              surgeryCaseId
            );
          }

          console.log(`Processed surgery case ${surgeryCaseId} successfully`);
        } catch (err) {
          errors.push(err.message);
          console.error("❌ Error processing surgery case:", err);
        }
      })
    );

    if (errors.length > 0) {
      res.status(500).json({ message: "Some surgery cases failed", errors });
    } else {
      res.status(200).json({ message: "Surgery cases processed successfully" });
    }
  } catch (err) {
    console.error("❌ Error processing surgery cases:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.createSurgeryCase = async (req, res) => {
  const { patient_id } = req.params;
  const surgeryCaseData = req.body;

  try {
    const parsedPatientId = parseInt(patient_id, 10);
    if (!parsedPatientId || isNaN(parsedPatientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    const requiredFields = [
      "doctor_id",
      "surgery_start_time",
      "surgery_end_time",
      "surgery_type_id",
      "operating_room_id",
      "status_id",
    ];

    const missingFields = requiredFields.filter(
      (field) => !surgeryCaseData[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    console.log("surgery_start_time", surgeryCaseData.surgery_start_time);
    console.log("surgery_end_time", surgeryCaseData.surgery_end_time);

    const overlappingCases = await db("surgery_case")
      .where("operating_room_id", surgeryCaseData.operating_room_id)
      .andWhere(function () {
        this.whereBetween("surgery_start_time", [
          surgeryCaseData.surgery_start_time,
          surgeryCaseData.surgery_end_time,
        ])
          .orWhereBetween("surgery_end_time", [
            surgeryCaseData.surgery_start_time,
            surgeryCaseData.surgery_end_time,
          ])
          .orWhere(function () {
            this.where(
              "surgery_start_time",
              "<=",
              surgeryCaseData.surgery_start_time
            ).andWhere(
              "surgery_end_time",
              ">=",
              surgeryCaseData.surgery_end_time
            );
          });
      })
      .then((overlappingCases) => overlappingCases);

    if (overlappingCases.length > 0) {
      return res.status(400).json({
        message:
          "The selected operating room has overlapping cases at this time.",
      });
    }

    const newSurgeryCase = await db("surgery_case")
      .insert({
        doctor_id: surgeryCaseData.doctor_id,
        surgery_end_time: surgeryCaseData.surgery_end_time,
        surgery_start_time: surgeryCaseData.surgery_start_time,
        surgery_type_id: surgeryCaseData.surgery_type_id,
        operating_room_id: surgeryCaseData.operating_room_id,
        status_id: surgeryCaseData.status_id,
        created_by: surgeryCaseData.created_by,
        patient_id: parsedPatientId,
        created_at: surgeryCaseData.created_at,
        patient_history: surgeryCaseData.patient_history || "",
      })
      .returning("*");

    if (!newSurgeryCase || newSurgeryCase.length === 0) {
      return res.status(500).json({ message: "Failed to create surgery case" });
    }

    const surgeryCaseId = newSurgeryCase[0].surgery_case_id;

    if (surgeryCaseData.Operation) {
      await db("operation").insert({
        surgery_case_id: surgeryCaseId,
        operation_name: surgeryCaseData.Operation,
      });
    }

    await db("surgery_case_status_history").insert({
      surgery_case_id: surgeryCaseId,
      status_id: 0,
      updated_at: new Date().toISOString(),
      updated_by: surgeryCaseData.created_by,
    });

    res.status(201).json({
      message: "Surgery case created successfully",
      data: newSurgeryCase[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    const caseCalendar = await db("surgery_case")
      .select(
        "surgery_case.surgery_case_id",
        "surgery_case.surgery_start_time",
        "surgery_case.surgery_end_time",
        "patients.hn_code",
        "doctors.doctor_id",
        db.raw(
          "CONCAT(doctors.firstname, ' ', doctors.lastname) AS doctor_fullname"
        )
      )
      .join("patients", "surgery_case.patient_id", "patients.patient_id")
      .join("doctors", "surgery_case.doctor_id", "doctors.doctor_id");

    if (!caseCalendar || caseCalendar.length === 0) {
      return res.status(404).json({
        message: "No surgery cases found",
      });
    }

    return res.status(200).json({
      message: "Fetched successfully",
      data: caseCalendar,
    });
  } catch (error) {
    console.error("Error fetching surgery cases:", error);

    return res.status(500).json({
      message: "An error occurred while fetching surgery cases",
      error: error.message || "Unknown error",
    });
  }
};

exports.createOperation = async (req, res) => {
  try {
    const { operation_name, surgery_case_id } = req.body;
    console.log("operation_name : ", operation_name);

    if (!operation_name) {
      return res.status(400).json({
        message: "Missing required fields: operation_name",
      });
    }
    if (!surgery_case_id) {
      return res.status(400).json({
        message: "Missing required fields: surgery_case_id",
      });
    }
    console.log("operation_name ", operation_name);
    console.log("surgery_case_id", surgery_case_id);

    const surgeryCase = await db("surgery_case")
      .select("surgery_case_id")
      .where("surgery_case_id", surgery_case_id)
      .first();

    if (!surgeryCase) {
      return res.status(404).json({
        message: "Surgery Case not found with the given ID",
      });
    }

    const existingOperation = await db("operation")
      .select("operation_id")
      .where("surgery_case_id", surgery_case_id)
      .first();

    if (existingOperation) {
      const updatedOperation = await db("operation")
        .where("surgery_case_id", surgery_case_id)
        .update({
          operation_name,
        })
        .returning(["operation_id", "operation_name", "surgery_case_id"]);

      if (updatedOperation.length > 0) {
        return res.status(200).json({
          message: "Operation updated successfully",
          data: updatedOperation[0],
        });
      } else {
        return res.status(500).json({
          message: "Failed to update operation",
        });
      }
    } else {
      const newOperation = await db("operation")
        .insert({
          operation_name,
          surgery_case_id,
        })
        .returning(["operation_id", "operation_name", "surgery_case_id"]);

      if (newOperation.length > 0) {
        return res.status(201).json({
          message: "Operation created successfully",
          data: newOperation[0],
        });
      } else {
        return res.status(500).json({
          message: "Failed to create operation",
        });
      }
    }
  } catch (error) {
    console.error("Error creating or updating operation:", error);
    return res.status(500).json({
      message: "An error occurred while creating or updating operation",
      error: error.message,
    });
  }
};

exports.getCaseByOrID = async (req, res) => {
  const { operating_room_id } = req.params;

  try {
    const cases = await SurgeryCase.getAllByOrID(operating_room_id);

    if (cases.length === 0) {
      return res
        .status(404)
        .json({ message: "No surgery cases found in this room." });
    }

    return res.status(200).json(cases);
  } catch (error) {
    console.error("Error fetching cases for operating room:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching surgery cases." });
  }
};

exports.updateSurgeryCase = async (req, res) => {
  try {
    const { surgery_case_id } = req.params;
    const surgeryCaseData = req.body;
    console.log("surgeryCaseData", surgeryCaseData);

    if (
      !surgeryCaseData.surgery_type_id ||
      !surgeryCaseData.doctor_id ||
      !surgeryCaseData.surgery_start_time ||
      !surgeryCaseData.surgery_end_time ||
      !surgeryCaseData.operating_room_id
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    const overlappingCases = await db("surgery_case")
      .where("operating_room_id", surgeryCaseData.operating_room_id)
      .andWhere(function () {
        this.whereBetween("surgery_start_time", [
          surgeryCaseData.surgery_start_time,
          surgeryCaseData.surgery_end_time,
        ])
          .orWhereBetween("surgery_end_time", [
            surgeryCaseData.surgery_start_time,
            surgeryCaseData.surgery_end_time,
          ])
          .orWhere(function () {
            this.where(
              "surgery_start_time",
              "<=",
              surgeryCaseData.surgery_start_time
            ).andWhere(
              "surgery_end_time",
              ">=",
              surgeryCaseData.surgery_end_time
            );
          });
      })
      .andWhere("surgery_case_id", "<>", surgery_case_id);

    if (overlappingCases.length > 0) {
      return res.status(400).json({
        message:
          "The selected operating room has overlapping cases at this time.",
      });
    }

    console.log("surgeryCaseData : ", surgeryCaseData);

    const updatedCase = await SurgeryCase.update(
      surgery_case_id,
      surgeryCaseData
    );

    if (updatedCase) {
      return res
        .status(200)
        .json({ message: "Surgery case updated successfully", updatedCase });
    } else {
      return res.status(404).json({ message: "Surgery case not found" });
    }
  } catch (error) {
    console.error("Error updating surgery case:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the surgery case." });
  }
};

exports.getCaseWithPatientById = async (req, res) => {
  const { surgery_case_id } = req.params;

  try {
    const caseData = await SurgeryCase.getCaseWithPatientById(surgery_case_id);

    if (!caseData) {
      return res.status(404).json({ message: "Surgery case not found" });
    }

    res.status(200).json({
      message: "Surgery case and patient details fetched successfully",
      data: caseData,
    });
  } catch (error) {
    console.error("Error in getCaseWithPatientById:", error);
    res.status(500).json({
      message: "Failed to retrieve surgery case data",
      details: error.message,
    });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลกรณีการผ่าตัดทั้งหมด
exports.getAllCase = async (req, res) => {
  try {
    const { search, doctor_id, limit = 6, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const lowerSearch = search ? search.trim().toLowerCase() : null;

    const addSearchConditions = (query) => {
      if (doctor_id) {
        query.where("surgery_case.doctor_id", doctor_id);
      }

      if (lowerSearch) {
        query.andWhere((builder) => {
          builder
            .whereRaw(
              'LOWER(CAST("surgery_case"."surgery_case_id" AS text)) LIKE ?',
              [`%${lowerSearch}%`]
            )
            .orWhereRaw("LOWER(patients.firstname) LIKE ?", [
              `%${lowerSearch}%`,
            ])
            .orWhereRaw("LOWER(patients.hn_code) LIKE ?", [`%${lowerSearch}%`])
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
        "doctors.prefix as doctor_prefix",
        "doctors.firstname as doctor_firstname",
        "doctors.lastname as doctor_lastname",
        "operating_room.room_name as room_name",
        "status.status_name as status_name",
        "surgery_case_links.surgery_case_links_id as link_id",
        "surgery_case_links.isactive as link_active",
        "surgery_case_links.expiration_time as link_expiration",
        "surgery_case_links.pin_encrypted as pin_encrypted",
        "surgery_type.surgery_type_name as surgery_type_name",
        "translations.translated_name as status_th",
        "operation.operation_name as operation_name"
      )
      .leftJoin(
        "operation",
        "surgery_case.surgery_case_id",
        "operation.surgery_case_id"
      )
      .leftJoin(
        "surgery_type",
        "surgery_case.surgery_type_id",
        "surgery_type.surgery_type_id"
      )
      .leftJoin("patients", "surgery_case.patient_id", "patients.patient_id")
      .leftJoin("doctors", "surgery_case.doctor_id", "doctors.doctor_id")
      .leftJoin(
        "operating_room",
        "surgery_case.operating_room_id",
        "operating_room.operating_room_id"
      )
      .leftJoin("status", "surgery_case.status_id", "status.status_id")
      .leftJoin("translations", function () {
        this.on("status.status_id", "=", "translations.ref_id").andOn(
          "translations.language_code",
          "=",
          db.raw("'th'")
        );
      })
      .leftJoin("surgery_case_links", function () {
        this.on(
          "surgery_case.surgery_case_id",
          "=",
          "surgery_case_links.surgery_case_id"
        ).andOn("surgery_case_links.isactive", "=", db.raw("true"));
      });

    addSearchConditions(query);

    const filteredCountQuery = query.clone();
    const filteredCount = await filteredCountQuery
      .clearSelect()
      .count({ count: "surgery_case.surgery_case_id" })
      .first()
      .then((result) => parseInt(result.count));

    const surgeryCases = await query
      .orderBy("surgery_case.surgery_case_id", "asc")
      .limit(Number(limit))
      .offset(offset);

    const decryptedSurgeryCases = surgeryCases.map((caseRecord) => {
      try {
        if (!caseRecord.pin_encrypted) {
          return {
            ...caseRecord,
            pin_decrypted: null,
          };
        }

        const key = Buffer.from(SECRET_KEY, "hex");
        const iv = Buffer.from(IV, "hex");
        const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);

        let decryptedPin = decipher.update(
          caseRecord.pin_encrypted,
          "base64",
          "utf8"
        );

        decryptedPin += decipher.final("utf8");

        return {
          ...caseRecord,
          pin_decrypted: decryptedPin,
        };
      } catch (err) {
        console.error(
          "Error decrypting PIN for case ID:",
          caseRecord.surgery_case_id,
          err
        );
        return {
          ...caseRecord,
          pin_decrypted: null,
        };
      }
    });

    res.status(200).json({
      data: decryptedSurgeryCases,
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

// ฟังก์ชันสำหรับอัปเดตข้อมูลกรณีการผ่าตัด
// exports.updateSurgeryCase = async (req, res) => {
//   const { id } = req.params;
//   const surgeryCaseData = req.body;
//   try {
//     const updatedSurgeryCase = await SurgeryCase.update(id, surgeryCaseData);
//     if (!updatedSurgeryCase) {
//       return res.status(404).json({
//         message: "Surgery case not found",
//       });
//     }
//     res.status(200).json({
//       message: "Surgery case updated successfully",
//       data: updatedSurgeryCase,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };

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
