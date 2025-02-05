const db = require("../config/database");

const linkCase = {
  getAllLinkCase: () => {
    return db("surgery_case_links").select("*");
  },

  getLinkById: (id) => {
    return db("surgery_case_links").where("surgery_case_links_id", id).first();
  },

  createLink: (linkCaseData) => {
    return db("surgery_case_links")
      .insert(linkCaseData)
      .returning("*")
      .then((result) => {
        if (result && result.length > 0) {
          return result[0];
        } else {
          throw new Error("Failed to create link case");
        }
      })
      .catch((error) => {
        throw new Error(`Error creating link case: ${error.message}`);
      });
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
      .where("scl.surgery_case_id", surgery_case_id)
      .andWhere("scl.isactive", true)
      .orderBy("scl.surgery_case_id", "desc")
      .first()
      .select(
        "scl.*",
        "s.staff_id",
        db.raw("concat(s.firstname, ' ', s.lastname) as staff_fullname")
      );
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
        last_attempt_time: new Date(lastAttemptTime),
      });
  },

  updateAttemptCount: (link, attempt_count, lock_until) => {
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
