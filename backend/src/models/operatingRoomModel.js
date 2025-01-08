const db = require("../config/database");

const OperatingRoom = {
  getAll: async () => {
    try {
      return await db("operating_room").select("*");
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      return await db("operating_room")
        .where({ operating_room_id: id })
        .first();
    } catch (error) {
      throw error;
    }
  },

  create: async (data) => {
    try {
      const [newOperatingRoom] = await db("operating_room")
        .insert(data)
        .returning("*");
      return newOperatingRoom;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const [updatedOperatingRoom] = await db("operating_room")
        .where({ operating_room_id: id })
        .update(data)
        .returning("*");
      return updatedOperatingRoom;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      return await db("operating_room").where({ operating_room_id: id }).del();
    } catch (error) {
      throw error;
    }
  },
};

module.exports = OperatingRoom;
