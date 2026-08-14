/**
 * Medicine API Service
 * 
 * REST API client interface for Pharmacy Inventory management.
 * Integrates with backend endpoints (/api/medicines) with automatic local storage fallback.
 */

import { apiRequest } from './apiClient';
import * as localStore from '../localStorageService';

export const medicineService = {
  /**
   * Fetch all medicines with optional search
   */
  async getMedicines(search = '') {
    const res = await apiRequest(`/medicines${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    if (res?.fallback || res?.isLocal) {
      let meds = localStore.getMedicines();
      if (search) {
        const q = search.toLowerCase();
        meds = meds.filter(m => 
          m.name.toLowerCase().includes(q) || 
          m.category.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
        );
      }
      return meds;
    }
    return res.data || res;
  },

  /**
   * Fetch single medicine by ID
   */
  async getMedicineById(id) {
    const res = await apiRequest(`/medicines/${id}`);
    if (res?.fallback || res?.isLocal) {
      const meds = localStore.getMedicines();
      return meds.find(m => m.id === id) || null;
    }
    return res.data || res;
  },

  /**
   * Add a new medicine to inventory
   */
  async createMedicine(medicineData) {
    const res = await apiRequest('/medicines', {
      method: 'POST',
      body: JSON.stringify(medicineData),
    });

    if (res?.fallback || res?.isLocal) {
      return localStore.addMedicine(medicineData);
    }
    return res.data || res;
  },

  /**
   * Update medicine details
   */
  async updateMedicine(id, medicineData) {
    const res = await apiRequest(`/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...medicineData }),
    });

    if (res?.fallback || res?.isLocal) {
      return localStore.updateMedicine({ id, ...medicineData });
    }
    return res.data || res;
  },

  /**
   * Quick Stock Adjustment
   */
  async adjustStock(id, newQuantity) {
    const res = await apiRequest(`/medicines/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: newQuantity }),
    });

    if (res?.fallback || res?.isLocal) {
      const meds = localStore.getMedicines();
      const target = meds.find(m => m.id === id);
      if (target) {
        return localStore.updateMedicine({ ...target, quantity: newQuantity });
      }
      return null;
    }
    return res.data || res;
  }
};
