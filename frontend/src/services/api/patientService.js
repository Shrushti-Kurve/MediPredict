import apiClient from "./apiClient";

// GET ALL PATIENTS
export const getPatients = async () => {
  return await apiClient("/patients/");
};

// GET ONE PATIENT
export const getPatient = async (patientId) => {
  return await apiClient(`/patients/${patientId}`);
};

// ADD PATIENT
export const addPatient = async (patientData) => {
  return await apiClient("/patients/", {
    method: "POST",
    body: patientData,
  });
};

// UPDATE PATIENT
export const updatePatient = async (patientId, patientData) => {
  return await apiClient(`/patients/${patientId}`, {
    method: "PUT",
    body: patientData,
  });
};

// DELETE PATIENT
export const deletePatient = async (patientId) => {
  return await apiClient(`/patients/${patientId}`, {
    method: "DELETE",
  });
};