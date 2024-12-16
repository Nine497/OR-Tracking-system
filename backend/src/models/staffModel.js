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
      .join(
        "permissions",
        "staff_permission.permission_id",
        "permissions.permission_id"
      )
      .select("permissions.permission_id", "permissions.permission_name")
      .where("staff_permission.staff_id", staffId);
  },

  getAllPermissions: () => {
    return db("permissions").select("permission_id", "permission_name");
  },

  updatePermissions: (staffId, permissionIds) => {
    return db.transaction(async (trx) => {
      try {
        await trx("staff_permission").where("staff_id", staffId).del();

        const permissions = permissionIds.map((permissionId) => ({
          staff_id: staffId,
          permission_id: permissionId,
        }));

        await trx("staff_permission").insert(permissions);
      } catch (error) {
        throw error;
      }
    });
  },
};

module.exports = Staff;
