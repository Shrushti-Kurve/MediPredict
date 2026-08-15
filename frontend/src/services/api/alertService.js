import apiClient from "./apiClient";

export const getAlerts = async () => {
  return await apiClient("/alerts/");
};

export const getAlertCount = async () => {
  return await apiClient("/alerts/count");
};

export const generateAlerts = async () => {
  return await apiClient("/alerts/generate", {
    method: "POST",
  });
};