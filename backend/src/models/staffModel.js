const db = require("../config/database");

const Staff = {
  findOne: (criteria) => {
    return db("staff").where(criteria).first();
  },

  getAll: () => {
    return db("staff").select("*");
  },

  create: (staffData) => {
    return db("staff")
      .insert(staffData)
      .returning("*")
      .then((newStaff) => newStaff[0]);
  },

  update: (id, staffData) => {
    return db("staff")
      .where("staff_id", id)
      .update(staffData)
      .returning("*")
      .then((updatedStaff) => updatedStaff[0]);
  },

  findById: (id) => {
    return db("staff").where("staff_id", id).first();
  },

  updateStatus: (id, isActive) => {
    return db("staff")
      .where("staff_id", id)
      .update({ isActive })
      .returning("*")
      .then((updatedStaff) => updatedStaff[0]);
  },

  getPermissionsByStaffId: (staffId) => {
    return db("staff_permission")
      .select("permission_id")
      .where("staff_id", staffId);
  },
};

module.exports = Staff;
