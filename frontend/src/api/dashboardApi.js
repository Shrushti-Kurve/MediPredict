import api from "./api";

export const getDashboard = async (data) => {
  const response = await api.post("/dashboard", data);
  return response.data;
};