import apiClient from "./apiClient";

export const getAlerts = async () => {
  return await apiClient("/alerts");
};