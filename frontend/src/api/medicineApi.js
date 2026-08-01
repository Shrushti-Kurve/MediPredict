import api from "./api";

export const getMedicine = async (disease) => {
  const response = await api.get(`/medicine/${disease}`);
  return response.data;
};