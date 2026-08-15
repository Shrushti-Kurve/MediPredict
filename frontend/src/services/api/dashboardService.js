import apiClient from "./apiClient";

// Dashboard summary
export const getDashboardSummary = async () => {
  return await apiClient("/dashboard/summary");
};

// Transactions
export const getTransactions = async () => {
  return await apiClient("/transactions");
};

// Outbreak predictions
export const getOutbreakPredictions = async () => {
  return await apiClient("/outbreak-predictions");
};

// Run outbreak prediction
export const predictOutbreak = async () => {
  return await apiClient("/predict-outbreak", {
    method: "POST",
    body: {},
  });
};