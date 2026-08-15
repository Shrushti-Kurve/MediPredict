import { prescribeMedicine } from './medicineService';

// Prescribe a single medicine using existing medicineService helper
export const prescribeOne = async ({ patient_id, medicine_id, quantity, user_id = null }) => {
  return await prescribeMedicine({
    patientId: patient_id,
    medicineId: medicine_id,
    quantity,
    userId: user_id
  });
};

// Prescribe multiple medicines sequentially using prescribeOne
export const prescribeMultiple = async ({ patient_id, medicines = [], user_id = null }) => {
  if (!Array.isArray(medicines)) throw new Error('medicines must be an array');

  const results = [];

  for (const m of medicines) {
    const medicine_id = m.medicine_id || m.Medicine_ID || m.id || m.medicineId;
    const quantity = m.quantity || m.qty || m.quantity_dispensed || 1;

    if (!medicine_id) {
      throw new Error('Missing medicine id in one of the medicines');
    }

    const res = await prescribeOne({ patient_id, medicine_id, quantity, user_id });
    results.push(res);
  }

  return results;
};
