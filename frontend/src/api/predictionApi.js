import api from "./api";

export const predictOutbreak = async (data) => {
  const response = await api.post("/predict-outbreak", data);
  return response.data;
};

export const predictDisease = predictOutbreak;