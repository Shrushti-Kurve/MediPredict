import React from 'react';
import MedicineStock from '../pharmacist/MedicineStock';
import { useEffect, useState } from "react";
import {
  getMedicines,
  updateMedicineStock,
} from "../../services/api/medicineService";

const DoctorMedicineStock = () => {
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const data = await getMedicines();
      setMedicines(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStockUpdate = async (medicineId, quantity) => {
    try {
      await updateMedicineStock(
        medicineId,
        Number(quantity)
      );

      await loadMedicines();

      alert("Stock updated successfully");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
        "Failed to update stock"
      );
    }
  };

  return (
    <MedicineStock
      readOnly={true}
      title="Doctor Medicine Stock"
      subtitle="Review live stock availability, expiry windows, and low-stock alerts from a clinical perspective."
    />
  );
};

export default DoctorMedicineStock;
