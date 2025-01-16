const db = require("../config/database");

const Staff = {
  findOne: (username) => {
    return db("staff").where(username).first();
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
    return db("permissions").select("*");
  },

  updatePermissions: (staff_id, permission_ids, gived_by, gived_at) => {
    return db.transaction(async (trx) => {
      try {
        if (!staff_id) {
          throw new Error("Staff ID is required");
        }

        await trx("staff_permission").where("staff_id", staff_id).del();

        if (Array.isArray(permission_ids) && permission_ids.length > 0) {
          const permissions = permission_ids.map((permissionId) => ({
            staff_id: staff_id,
            permission_id: permissionId,
            gived_by: gived_by,
            gived_at: gived_at,
          }));

          await trx("staff_permission").insert(permissions);
        }
      } catch (error) {
        console.error("Error during permission update:", error);
        throw error;
      }
    });
  },
};

module.exports = Staff;
