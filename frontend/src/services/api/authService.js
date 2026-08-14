/**
 * Authentication API Service
 * 
 * REST API client interface for user authentication and profile management.
 */

import { apiRequest } from './apiClient';
import * as localStore from '../localStorageService';

export const authService = {
  /**
   * Log in user
   */
  async login(email, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res?.fallback || res?.isLocal) {
      return localStore.login(email, password);
    }

    if (res?.token) {
      localStorage.setItem('authToken', res.token);
    }
    if (res?.user) {
      localStore.setLoggedInUser(res.user);
      return res.user;
    }
    return null;
  },

  /**
   * Register a new user
   */
  async signup(userData) {
    const res = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (res?.fallback || res?.isLocal) {
      return localStore.signup(userData);
    }
    return res.user || res.data;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    return localStore.getLoggedInUser();
  },

  /**
   * Log out current session
   */
  async logout() {
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('authToken');
    localStore.logout();
  },

  /**
   * Update profile details
   */
  async updateProfile(userData) {
    const res = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });

    if (res?.fallback || res?.isLocal) {
      return localStore.updateUserProfile(userData);
    }
    return res.user || res.data;
  }
};
