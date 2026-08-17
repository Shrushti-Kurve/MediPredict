import { prescribeMedicine } from './medicineService';
import apiClient from './apiClient';

// Prescribe a single medicine using existing medicineService helper
export const prescribeOne = async ({ patient_id, medicine_name, quantity, user_id = null }) => {
  return await prescribeMedicine({
    patientId: patient_id,
    medicineName: medicine_name,
    quantity,
    userId: user_id
  });
};

// Prescribe multiple medicines sequentially using prescribeOne
export const prescribeMultiple = async ({ patient_id, medicines = [], user_id = null }) => {
  if (!Array.isArray(medicines)) throw new Error('medicines must be an array');

  // Call bulk endpoint once so patient can be deleted after all prescriptions
  return await apiClient('/prescriptions/bulk', {
    method: 'POST',
    body: { patient_id, medicines, user_id }
  });
};
