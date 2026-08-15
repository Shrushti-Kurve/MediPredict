import apiClient from "./apiClient";

// GET ALL MEDICINES
export const getMedicines = async () => {
  return await apiClient("/medicines/");
};

// GET ONE MEDICINE
export const getMedicine = async (medicineId) => {
  return await apiClient(`/medicines/${medicineId}`);
};

// ADD MEDICINE
export const addMedicine = async (medicineData) => {
  return await apiClient("/medicines/", {
    method: "POST",
    body: medicineData,
  });
};

// UPDATE STOCK
export const updateMedicineStock = async (medicineId, quantity) => {
  return await apiClient(`/medicines/${medicineId}/stock`, {
    method: "PUT",
    body: {
      Quantity: quantity,
    },
  });
};

// MEDICINE REQUIREMENT
export const getMedicineRequirement = async (disease) => {
  return await apiClient(
    `/medicines/requirement/${encodeURIComponent(disease)}`
  );
};