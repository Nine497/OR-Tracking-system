import axiosInstance from "../api/axiosInstance";

export const checkPermission = async (staffId, permission) => {
  try {
    const response = await axiosInstance.get(
      `/staff/checkPermission/${staffId}`,
      { params: { permission } }
    );
    return response.data.hasPermission;
  } catch (error) {
    console.error("Permission check failed:", error);
    throw new Error("Permission check failed");
  }
};
