/**
 * Patient API Service
 * 
 * REST API client interface for patient records.
 * Integrates with backend endpoints (/api/patients) with automatic local storage fallback.
 */

import { apiRequest } from './apiClient';
import * as localStore from '../localStorageService';

export const patientService = {
  /**
   * Fetch all patients with optional filtering
   */
  async getPatients(filters = {}) {
    const res = await apiRequest('/patients');
    if (res?.fallback || res?.isLocal) {
      let patients = localStore.getPatients();
      if (filters.search) {
        const q = filters.search.toLowerCase();
        patients = patients.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.id.toLowerCase().includes(q) ||
          p.phone.includes(q)
        );
      }
      if (filters.disease) {
        patients = patients.filter(p => p.disease === filters.disease);
      }
      if (filters.status) {
        patients = patients.filter(p => p.status === filters.status);
      }
      return patients;
    }
    return res.data || res;
  },

  /**
   * Fetch a single patient by ID
   */
  async getPatientById(id) {
    const res = await apiRequest(`/patients/${id}`);
    if (res?.fallback || res?.isLocal) {
      const patients = localStore.getPatients();
      return patients.find(p => p.id === id) || null;
    }
    return res.data || res;
  },

  /**
   * Create a new patient record (Used by Hospital Staff)
   * Note: Hospital staff does NOT have permission to assign medicines.
   */
  async createPatient(patientData) {
    const res = await apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });

    if (res?.fallback || res?.isLocal) {
      return localStore.addPatient(patientData);
    }
    return res.data || res;
  },

  /**
   * Update patient demographic / registration details (Hospital Staff)
   * Hospital staff cannot modify doctor's prescribed medicines.
   */
  async updatePatient(id, patientData) {
    const res = await apiRequest(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...patientData }),
    });

    if (res?.fallback || res?.isLocal) {
      return localStore.updatePatient({ id, ...patientData });
    }
    return res.data || res;
  },

  /**
   * Prescribe Multiple Medicines for a Patient (Doctor Exclusive Endpoint)
   * @param {string} patientId 
   * @param {Object} prescriptionData - { medicines: [{ name, dosage, frequency, duration, quantity, instructions }], disease, notes, status }
   */
  async prescribeMedicines(patientId, prescriptionData) {
    const res = await apiRequest(`/patients/${patientId}/prescriptions`, {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    });

    if (res?.fallback || res?.isLocal) {
      return localStore.prescribeMedicines(patientId, prescriptionData);
    }
    return res.data || res;
  },

  /**
   * Delete patient record
   */
  async deletePatient(id) {
    const res = await apiRequest(`/patients/${id}`, {
      method: 'DELETE',
    });

    if (res?.fallback || res?.isLocal) {
      return localStore.deletePatient(id);
    }
    return res.success || true;
  }
};
