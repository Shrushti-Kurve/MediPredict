import api from "./api";

export const getMedicineDemand = async (data) => {
  const response = await api.post("/medicine-demand", data);
  return response.data;
};