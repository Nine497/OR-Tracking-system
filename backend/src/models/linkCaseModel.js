const db = require("../config/database");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);
const linkCase = {
  getAllLinkCase: () => {
    return db("surgery_case_links").select("*");
  },

  getLinkById: (id) => {
    return db("surgery_case_links").where("surgery_case_links_id", id).first();
  },

  getIsActiveById: (id) => {
    return db("surgery_case_links")
      .select("isactive")
      .where("surgery_case_links_id", id)
      .first();
  },

  createLink: async (linkCaseData) => {
    try {
      const result = await db("surgery_case_links")
        .insert(linkCaseData)
        .returning("*");

      if (result && result.length > 0) {
        const surgeryCaseId = result[0].surgery_case_id;

        const patientData = await db("surgery_case")
          .join("patients as p", "p.patient_id", "=", "surgery_case.patient_id")
          .select(
            "p.firstname as patient_firstname",
            "p.lastname as patient_lastname"
          )
          .where("surgery_case.surgery_case_id", surgeryCaseId)
          .first();

        const staffData = await db("surgery_case_links")
          .join(
            "staff as s",
            "s.staff_id",
            "=",
            "surgery_case_links.created_by"
          )
          .select(
            db.raw("concat(s.firstname, ' ', s.lastname) as staff_fullname")
          )
          .where(
            "surgery_case_links.surgery_case_links_id",
            result[0].surgery_case_links_id
          )
          .first();

        return {
          ...result[0],
          patient_firstname: patientData.patient_firstname,
          patient_lastname: patientData.patient_lastname,
          staff_fullname: staffData.staff_fullname,
        };
      } else {
        throw new Error("Failed to create link case");
      }
    } catch (error) {
      throw new Error(`Error creating link case: ${error.message}`);
    }
  },

  updateLink: (id, linkCaseData) => {
    return db("surgery_case_links")
      .where("surgery_case_links_id", id)
      .update(linkCaseData)
      .returning("*");
  },

  updateLinkStatus: (surgery_case_links_id, isactive) => {
    return db("surgery_case_links")
      .where("surgery_case_links_id", surgery_case_links_id)
      .update({ isactive })
      .returning("*")
      .then((result) => {
        if (result && result.length > 0) {
          return result[0];
        } else {
          throw new Error("Failed to update link status");
        }
      })
      .catch((error) => {
        throw new Error(`Error updating link status: ${error.message}`);
      });
  },

  getLatestActiveLinkCaseBySurgeryCaseId: (surgery_case_id) => {
    return db("surgery_case_links as scl")
      .join("staff as s", "scl.created_by", "=", "s.staff_id")
      .join(
        "surgery_case as sc",
        "sc.surgery_case_id",
        "=",
        "scl.surgery_case_id"
      )
      .join("patients as p", "sc.patient_id", "=", "p.patient_id")
      .where("scl.surgery_case_id", surgery_case_id)
      .andWhere("scl.isactive", true)
      .select(
        "scl.*",
        "s.staff_id",
        "p.firstname as patient_firstname",
        "p.lastname as patient_lastname",
        db.raw("concat(s.firstname, ' ', s.lastname) as staff_fullname")
      )
      .orderBy("scl.surgery_case_id", "desc")
      .first();
  },

  createReview: (surgery_case_id, review_text, rating) => {
    return db("link_reviews")
      .insert({
        surgery_case_id,
        review_text,
        rating,
        reviewed_at: db.fn.now(),
      })
      .returning("*")
      .then((result) => {
        if (result && result.length > 0) {
          return result[0];
        } else {
          throw new Error("Failed to submit review");
        }
      })
      .catch((error) => {
        throw new Error(`Error submitting review: ${error.message}`);
      });
  },
  updateAttemptCount: (surgery_case_id, newAttemptCount, lastAttemptTime) => {
    return db("surgery_case_links")
      .where("surgery_case_id", surgery_case_id)
      .update({
        attempt_count: newAttemptCount,
        last_attempt_time: dayjs(lastAttemptTime).toDate(),
      });
  },

  updateLockUntil: (link, attempt_count, lock_until) => {
    return db("surgery_case_links")
      .where("surgery_case_links_id", link)
      .update({
        attempt_count,
        lock_until: lock_until,
      })
      .returning("lock_until");
  },

  resetAttemptCount: (link) => {
    return db("surgery_case_links")
      .where("surgery_case_links_id", link)
      .update({ attempt_count: 0, lock_until: null });
  },
};

module.exports = linkCase;
