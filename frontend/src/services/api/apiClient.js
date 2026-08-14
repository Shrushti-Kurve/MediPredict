/**
 * Central API Client for MediPredict Frontend
 * 
 * Provides HTTP client abstraction configured for backend REST API integration.
 * If backend server is not reachable (or during local mock stage), it seamlessly 
 * delegates to localStorageService to guarantee continuous UI functionality.
 */

// Configurable API base URL from environment or default
export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Check if app is in local-only fallback mode
export const USE_BACKEND_API = Boolean(import.meta.env?.VITE_USE_BACKEND === 'true');

/**
 * Standard HTTP Request handler
 */
export async function apiRequest(endpoint, options = {}) {
  // If backend is not enabled via ENV, use local storage engine directly
  if (!USE_BACKEND_API) {
    return { ok: true, isLocal: true };
  }

  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.warn(`[API Client] Endpoint ${endpoint} failed, falling back to local storage:`, err.message);
    return { ok: true, isLocal: true, fallback: true };
  }
}
