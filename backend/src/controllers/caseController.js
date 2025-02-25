const SurgeryCase = require("../models/caseModel");
const db = require("../config/database");
const crypto = require("crypto");
const SECRET_KEY = process.env.SECRET_KEY;
const IV = process.env.IV;
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

require("dotenv").config();
dayjs.extend(utc);
dayjs.extend(timezone);

exports.newSurgerycaseFromAPI = async (req, res) => {
  const surgeryCaseData = req.body;
  let errors = [];

  try {
    await Promise.all(
      surgeryCaseData.map(async (data) => {
        try {
          const opType = data.op_type ? data.op_type : "-";

          const existingSurgeryType = await SurgeryCase.getSurgeryTypeByName(
            opType
          );
          let surgeryTypeId = existingSurgeryType
            ? existingSurgeryType.surgery_type_id
            : await SurgeryCase.createSurgeryType(opType);

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
          const surgeryStartTimeUTC = dayjs(data.op_datetime)
            .tz("Asia/Bangkok", true)
            .utc()
            .format("YYYY-MM-DD HH:mm:ss");

          const surgeryEndTimeUTC = dayjs(data.estimate_finish)
            .tz("Asia/Bangkok", true)
            .utc()
            .format("YYYY-MM-DD HH:mm:ss");

          // if (existingSurgeryCase) {
          //   await SurgeryCase.updateSurgeryCase(
          //     existingSurgeryCase.surgery_case_id,
          //     {
          //       doctor_id: doctorId,
          //       surgery_type_id: surgeryTypeId,
          //       operating_room_id: operatingRoomId,
          //       patient_id: patientId,
          //       status_id: data?.status_id || 0,
          //       created_by: data?.created_by || 1,
          //       created_at: data.set_datetime,
          //       note: data.note,
          //       surgery_start_time: surgeryStartTimeUTC,
          //       surgery_end_time: surgeryEndTimeUTC,
          //     }
          //   );

          // } else {
          let surgeryCaseId;
          if (!existingSurgeryCase) {
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
              surgery_start_time: surgeryStartTimeUTC,
              surgery_end_time: surgeryEndTimeUTC,
            });

            await db("surgery_case_status_history").insert({
              surgery_case_id: surgeryCaseId,
              status_id: 0,
              updated_at: new Date().toISOString(),
              updated_by: data?.created_by || 1,
            });
          } else {
            surgeryCaseId = existingSurgeryCase.surgery_case_id;
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
  console.log("surgeryCaseData Create:", surgeryCaseData);

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

    // const surgeryStartTime = dayjs(surgeryCaseData.surgery_start_time)
    //   .tz("Asia/Bangkok", true)
    //   .utc()
    //   .format("YYYY-MM-DD HH:mm:ss");

    // const surgeryEndTime = dayjs(surgeryCaseData.surgery_end_time)
    //   .tz("Asia/Bangkok", true)
    //   .utc()
    //   .format("YYYY-MM-DD HH:mm:ss");

    // if (dayjs(surgeryEndTime).isBefore(surgeryStartTime)) {
    //   return res.status(400).json({
    //     message: "End time cannot be earlier than start time",
    //   });
    // }
    // const overlappingCases = await db("surgery_case")
    //   .where("operating_room_id", surgeryCaseData.operating_room_id)
    //   .andWhere(function () {
    //     this.whereBetween("surgery_start_time", [
    //       surgeryStartTime,
    //       surgeryEndTime,
    //     ])
    //       .orWhereBetween("surgery_end_time", [
    //         surgeryStartTime,
    //         surgeryEndTime,
    //       ])
    //       .orWhere(function () {
    //         this.where("surgery_start_time", "<=", surgeryStartTime).andWhere(
    //           "surgery_end_time",
    //           ">=",
    //           surgeryEndTime
    //         );
    //       });
    //   });

    // if (overlappingCases.length > 0) {
    //   return res.status(409).json({
    //     message:
    //       "The selected operating room has overlapping cases at this time.",
    //   });
    // }

    const overlappingCases = await db("surgery_case")
      .where("operating_room_id", surgeryCaseData.operating_room_id)
      .whereNot("surgery_case_id", surgeryCaseData.surgery_case_id)
      .whereNot("operating_room_id", 8)
      .where(function () {
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
              "<",
              surgeryCaseData.surgery_start_time
            ).where("surgery_end_time", ">", surgeryCaseData.surgery_end_time);
          })
          .orWhere(function () {
            this.where(
              "surgery_start_time",
              ">",
              surgeryCaseData.surgery_start_time
            ).where("surgery_end_time", "<", surgeryCaseData.surgery_end_time);
          });
      });

    if (overlappingCases.length > 0) {
      return res.status(409).json({
        message:
          "The selected operating room is not available during this time",
      });
    }

    const newSurgeryCase = await db("surgery_case")
      .insert({
        doctor_id: surgeryCaseData.doctor_id,
        surgery_start_time: surgeryStartTime,
        surgery_end_time: surgeryEndTime,
        surgery_type_id: surgeryCaseData.surgery_type_id,
        operating_room_id: surgeryCaseData.operating_room_id,
        status_id: 0,
        created_by: surgeryCaseData.created_by,
        patient_id: parsedPatientId,
        created_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
        patient_history: surgeryCaseData.patient_history || "",
        note: surgeryCaseData.note || "",
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
      updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
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
        "operating_room.room_name",
        db.raw(
          "CONCAT(doctors.prefix,doctors.firstname, ' ', doctors.lastname) AS doctor_fullname"
        ),
        db.raw(
          "CONCAT(patients.firstname, ' ', patients.lastname) AS patients_fullname"
        )
      )
      .join("patients", "surgery_case.patient_id", "patients.patient_id")
      .join("doctors", "surgery_case.doctor_id", "doctors.doctor_id")
      .join(
        "operating_room",
        "surgery_case.operating_room_id",
        "operating_room.operating_room_id"
      );

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
      .whereNot("surgery_case_id", surgery_case_id)
      .whereNot("operating_room_id", 8)
      .where(function () {
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
              "<",
              surgeryCaseData.surgery_start_time
            ).where("surgery_end_time", ">", surgeryCaseData.surgery_end_time);
          })
          .orWhere(function () {
            this.where(
              "surgery_start_time",
              ">",
              surgeryCaseData.surgery_start_time
            ).where("surgery_end_time", "<", surgeryCaseData.surgery_end_time);
          });
      });

    if (overlappingCases.length > 0) {
      return res.status(409).json({
        message:
          "The selected operating room is not available during this time",
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
    console.log("caseData : ", caseData);
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

exports.getAllCase = async (req, res) => {
  try {
    let {
      endDate,
      startDate,
      search,
      doctor_id,
      status_id,
      limit = 6,
      page = 1,
      isActive,
    } = req.query;

    // ตรวจสอบค่า limit และ page ให้ถูกต้อง
    limit = Math.max(1, parseInt(limit, 10) || 6);
    page = Math.max(1, parseInt(page, 10) || 1);
    const offset = (page - 1) * limit;
    const lowerSearch = search ? `%${search.trim().toLowerCase()}%` : null;

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
        "surgery_case_links.expiration_time as expiration_time",
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

    // กรองข้อมูลตามเงื่อนไขที่กำหนด
    if (doctor_id) query.andWhere("surgery_case.doctor_id", doctor_id);
    if (status_id) query.andWhere("surgery_case.status_id", status_id);
    if (lowerSearch) {
      query.andWhere((qb) => {
        qb.whereRaw(
          "LOWER(CAST(surgery_case.surgery_case_id AS text)) LIKE ?",
          [lowerSearch]
        )
          .orWhereRaw("LOWER(patients.firstname) LIKE ?", [lowerSearch])
          .orWhereRaw("LOWER(patients.hn_code) LIKE ?", [lowerSearch])
          .orWhereRaw("LOWER(operating_room.room_name) LIKE ?", [lowerSearch]);
      });
    }
    if (isActive != null)
      query.andWhere("surgery_case.isactive", isActive === "true");

    const startDateTime = dayjs(startDate)
      .tz("Asia/Bangkok")
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    const endDateTime = dayjs(endDate)
      .tz("Asia/Bangkok")
      .endOf("day")
      .format("YYYY-MM-DD HH:mm:ss");

    console.log("startDateTime:", startDateTime);
    console.log("endDateTime:", endDateTime);

    if (startDate && endDate) {
      query.andWhereRaw(
        `DATE(surgery_case.surgery_start_time AT TIME ZONE 'Asia/Bangkok') BETWEEN ? AND ?`,
        [startDateTime, endDateTime]
      );
    }

    const [{ total: totalRecords } = { total: 0 }] = await query
      .clone()
      .clearSelect()
      .count("surgery_case.surgery_case_id as total");

    const surgeryCases = await query
      .orderByRaw("surgery_case.surgery_start_time ASC NULLS LAST")
      .limit(limit)
      .offset(offset);

    res.status(200).json({ data: surgeryCases, totalRecords });
  } catch (err) {
    console.error("Server Error:", err);
    res
      .status(500)
      .json({ message: "Server error", error: err.message, stack: err.stack });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลกรณีการผ่าตัดทั้งหมด
// exports.getAllCase = async (req, res) => {
//   try {
//     let {
//       search,
//       doctor_id,
//       status_id,
//       limit = 6,
//       page = 1,
//       isActive,
//     } = req.query;
//     limit = parseInt(limit, 10);
//     page = parseInt(page, 10);
//     if (isNaN(limit) || limit <= 0) limit = 6;
//     if (isNaN(page) || page <= 0) page = 1;
//     const offset = (page - 1) * limit;
//     const lowerSearch = search ? `%${search.trim().toLowerCase()}%` : null;

//     let query = db("surgery_case")
//       .select(
//         "surgery_case.*",
//         "patients.firstname as patient_firstname",
//         "patients.lastname as patient_lastname",
//         "patients.hn_code as hn_code",
//         "doctors.prefix as doctor_prefix",
//         "doctors.firstname as doctor_firstname",
//         "doctors.lastname as doctor_lastname",
//         "operating_room.room_name as room_name",
//         "status.status_name as status_name",
//         "surgery_case_links.surgery_case_links_id as link_id",
//         "surgery_case_links.isactive as link_active",
//         "surgery_case_links.expiration_time as expiration_time",
//         "surgery_case_links.pin_encrypted as pin_encrypted",
//         "surgery_type.surgery_type_name as surgery_type_name",
//         "translations.translated_name as status_th",
//         "operation.operation_name as operation_name"
//       )
//       .leftJoin(
//         "operation",
//         "surgery_case.surgery_case_id",
//         "operation.surgery_case_id"
//       )
//       .leftJoin(
//         "surgery_type",
//         "surgery_case.surgery_type_id",
//         "surgery_type.surgery_type_id"
//       )
//       .leftJoin("patients", "surgery_case.patient_id", "patients.patient_id")
//       .leftJoin("doctors", "surgery_case.doctor_id", "doctors.doctor_id")
//       .leftJoin(
//         "operating_room",
//         "surgery_case.operating_room_id",
//         "operating_room.operating_room_id"
//       )
//       .leftJoin("status", "surgery_case.status_id", "status.status_id")
//       .leftJoin("translations", function () {
//         this.on("status.status_id", "=", "translations.ref_id").andOn(
//           "translations.language_code",
//           "=",
//           db.raw("'th'")
//         );
//       })
//       .leftJoin("surgery_case_links", function () {
//         this.on(
//           "surgery_case.surgery_case_id",
//           "=",
//           "surgery_case_links.surgery_case_id"
//         ).andOn("surgery_case_links.isactive", "=", db.raw("true"));
//       });

//     // กรอง doctor_id
//     if (doctor_id) {
//       query.andWhere("surgery_case.doctor_id", doctor_id);
//     }
//     // กรอง status_id
//     if (status_id) {
//       query.andWhere("surgery_case.status_id", status_id);
//     }

//     // กรอง search
//     if (lowerSearch) {
//       query.andWhere((qb) => {
//         qb.whereRaw(
//           "LOWER(CAST(surgery_case.surgery_case_id AS text)) LIKE ?",
//           [lowerSearch]
//         )
//           .orWhereRaw("LOWER(patients.firstname) LIKE ?", [lowerSearch])
//           .orWhereRaw("LOWER(patients.hn_code) LIKE ?", [lowerSearch])
//           .orWhereRaw("LOWER(operating_room.room_name) LIKE ?", [lowerSearch]);
//       });
//     }

//     // กรอง isActive
//     if (isActive != null) {
//       if (isActive === "true") {
//         query.andWhere("surgery_case.isactive", true);
//       } else if (isActive === "false") {
//         query.andWhere("surgery_case.isactive", false);
//       }
//     }

//     // นับจำนวนที่ผ่านการกรอง
//     const totalQuery = query
//       .clone()
//       .clearSelect()
//       .count("surgery_case.surgery_case_id as total")
//       .first();
//     const totalRecords = (await totalQuery)?.total || 0;

//     // เรียงลำดับให้ใกล้ปัจจุบันที่สุดก่อน
//     query.orderByRaw(
//       "CASE WHEN DATE(surgery_start_time) >= CURRENT_DATE THEN 1 ELSE 2 END, DATE(surgery_start_time) ASC NULLS LAST"
//     );

//     // ดึงข้อมูลตาม pagination
//     const surgeryCases = await query.limit(limit).offset(offset);

//     res.status(200).json({
//       data: surgeryCases,
//       totalRecords,
//     });
//   } catch (err) {
//     console.error("Server Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

exports.getAllCaseIsActive = async (req, res) => {
  try {
    const currentDate = dayjs().startOf("day").toDate();
    const futureDate = dayjs().add(90, "days").endOf("day").toDate();

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
        "surgery_case_links.expiration_time as expiration_time",
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
      })
      .where("surgery_case.isactive", true)
      // เงื่อนไขเพิ่มเวลา surgery_start_time ที่ระบุว่าเป็นวันนี้ + 90 วัน
      .andWhere("surgery_case.surgery_start_time", ">=", currentDate)
      .andWhere("surgery_case.surgery_start_time", "<=", futureDate)
      .orderByRaw(
        "ABS(EXTRACT(EPOCH FROM (surgery_start_time - NOW()))) NULLS LAST"
      );

    const surgeryCases = await query;

    res.status(200).json({
      data: surgeryCases,
    });
  } catch (err) {
    console.error("Server Error:", err);
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

exports.updateOR_roomBycaseId = async (req, res) => {
  console.log("Received data:", req.body);
  console.log("Received ID:", req.params.id);
  const { operating_room_id } = req.body;
  const { id } = req.params;

  if (!operating_room_id) {
    return res.status(400).json({
      message: "operating_room_id is required",
    });
  }

  try {
    // ดึงข้อมูลเคสผ่าตัดเพื่อตรวจสอบช่วงเวลา
    const surgeryCase = await db("surgery_case")
      .where("surgery_case_id", id)
      .first();

    if (!surgeryCase) {
      return res.status(404).json({ message: "Surgery case not found" });
    }
    console.log("surgeryCase", surgeryCase);

    const { surgery_start_time, surgery_end_time } = surgeryCase;

    // ตรวจสอบว่าห้องที่ต้องการอัปเดตว่างในช่วงเวลานั้นหรือไม่
    const overlappingCases = await db("surgery_case")
      .where("operating_room_id", operating_room_id)
      .whereNot("surgery_case_id", id)
      .whereNot("operating_room_id", 8)
      .where(function () {
        this.whereBetween("surgery_start_time", [
          surgery_start_time,
          surgery_end_time,
        ])
          .orWhereBetween("surgery_end_time", [
            surgery_start_time,
            surgery_end_time,
          ])
          .orWhere(function () {
            this.where("surgery_start_time", "<", surgery_start_time).where(
              "surgery_end_time",
              ">",
              surgery_end_time
            );
          })
          .orWhere(function () {
            this.where("surgery_start_time", ">", surgery_start_time).where(
              "surgery_end_time",
              "<",
              surgery_end_time
            );
          });
      });

    if (overlappingCases.length > 0) {
      return res.status(400).json({
        message:
          "The selected operating room is not available during this time",
      });
    }

    // อัปเดตห้องผ่าตัด
    const updatedRows = await db("surgery_case")
      .where("surgery_case_id", id)
      .update({ operating_room_id })
      .returning("*");

    if (!updatedRows || updatedRows.length === 0) {
      return res.status(404).json({ message: "Surgery case not found" });
    }

    res.status(200).json({
      message: "Operating room updated successfully",
      updatedRecord: updatedRows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.updateStatusById = async (req, res) => {
  const { status_id, updatedBy } = req.body;
  const { id } = req.params;

  if (status_id === null || status_id === undefined) {
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
        updated_at: dayjs().utc().format("YYYY-MM-DD HH:mm:ss"),
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

exports.updateIsactive = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    console.log("id", id);
    console.log("isActive", isActive);

    const surgeryCase = await SurgeryCase.findByIdAndUpdate(id, isActive);

    if (!surgeryCase) {
      return res.status(404).json({ message: "surgeryCase not found" });
    }

    res.json({ message: "Status updated successfully", surgeryCase });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
