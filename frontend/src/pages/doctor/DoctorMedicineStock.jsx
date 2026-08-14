import React from 'react';
import MedicineStock from '../pharmacist/MedicineStock';

const DoctorMedicineStock = () => {
  return (
    <MedicineStock
      readOnly={true}
      title="Doctor Medicine Stock"
      subtitle="Review live stock availability, expiry windows, and low-stock alerts from a clinical perspective."
    />
  );
};

export default DoctorMedicineStock;
