import api from "./api";

export const predictDisease = async (data) => {
  const response = await api.post("/predict-disease", data);
  return response.data;
};