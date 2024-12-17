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

  getLatestActiveLinkCaseBySurgeryCaseId: (surgery_case_id) => {
    return db("surgery_case_links")
      .where("surgery_case_id", surgery_case_id)
      .andWhere("isactive", true)
      .orderBy("created_at", "desc")
      .first();
  },
};

module.exports = linkCase;
