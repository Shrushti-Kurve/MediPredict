/**
 * Alert API Service
 * 
 * REST API client interface for system and role-based operational alerts.
 */

import { apiRequest } from './apiClient';
import * as localStore from '../localStorageService';

export const alertService = {
  /**
   * Fetch alerts with optional role filter
   */
  async getAlerts(role = null) {
    const endpoint = role ? `/alerts?role=${encodeURIComponent(role)}` : '/alerts';
    const res = await apiRequest(endpoint);
    
    if (res?.fallback || res?.isLocal) {
      const alerts = localStore.getAlerts();
      return role ? alerts.filter(a => a.role === role) : alerts;
    }
    return res.data || res;
  },

  /**
   * Create an alert
   */
  async createAlert(type, message, role = 'hospitalStaff') {
    const res = await apiRequest('/alerts', {
      method: 'POST',
      body: JSON.stringify({ type, message, role }),
    });

    if (res?.fallback || res?.isLocal) {
      return localStore.addAlert(type, message, role);
    }
    return res.data || res;
  }
};
