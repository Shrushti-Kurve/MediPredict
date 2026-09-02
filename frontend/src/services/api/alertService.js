import apiClient from "./apiClient";

const normalizeAlertSeverity = (alert = {}) => {
  const rawValue = [alert.severity, alert.Severity, alert.type, alert.Type, alert.alert_type, alert.Alert_Type]
    .find(value => value !== undefined && value !== null && value !== '')
    ?.toString()
    .toUpperCase() || '';

  if (/CRITICAL|URGENT|HIGH|DANGER|RED/.test(rawValue)) return 'Critical';
  if (/WARNING|ATTENTION|MEDIUM|YELLOW/.test(rawValue)) return 'Warning';
  return 'Info';
};

const normalizeAlert = (alert = {}, fallbackRole = '') => {
  const title = alert.title || alert.Alert_Title || alert.message || alert.Alert_Message || 'System Alert';
  const description = alert.description || alert.Description || alert.message || alert.Alert_Message || 'No alert details provided.';
  const role = alert.role || alert.Role || fallbackRole || (
    (alert.Alert_Category || alert.category || '').toString().toUpperCase().includes('MEDICINE') ? 'pharmacist' :
    (alert.Alert_Category || alert.category || '').toString().toUpperCase().includes('DISEASE') ? 'doctor' :
    'hospitalStaff'
  );

  return {
    id: alert.id || alert.Alert_ID || `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    title: title.toString().trim(),
    description: description.toString().trim(),
    message: description.toString().trim(),
    type: normalizeAlertSeverity(alert),
    severity: normalizeAlertSeverity(alert),
    status: normalizeAlertSeverity(alert),
    date: alert.date || alert.Alert_Date || alert.created_at || alert.Created_At || alert.timestamp || alert.Timestamp || '',
    category: alert.category || alert.Alert_Category || '',
    alert_type: alert.alert_type || alert.Alert_Type || '',
    raw: alert
  };
};

export const getAlerts = async () => {
  return await apiClient("/alerts/").catch(() => {
    try {
      return JSON.parse(localStorage.getItem('alerts') || '[]');
    } catch {
      return [];
    }
  });
};

export const getRoleAlerts = async (role) => {
  const rawAlerts = await getAlerts();
  const sourceAlerts = Array.isArray(rawAlerts) ? rawAlerts : [];

  return sourceAlerts
    .map((alert) => normalizeAlert(alert, role))
    .filter((alert) => {
      const alertRole = alert.role?.toLowerCase();
      const messageText = `${alert.title} ${alert.description}`.toLowerCase();
      const category = (alert.category || '').toString().toUpperCase();
      const alertType = (alert.alert_type || '').toString().toUpperCase();

      if (alertRole === role) return true;

      if (role === 'admin') {
        return true;
      }

      if (role === 'doctor') {
        return category.includes('DISEASE') || alertType.includes('DISEASE') || /patient|condition|diagnosis|critical|follow-up/i.test(messageText);
      }

      if (role === 'hospitalStaff') {
        return category.includes('DISEASE') || category.includes('PATIENT') || alertType.includes('DISEASE') || /patient|admission|record|status|follow-up|hospital/i.test(messageText);
      }

      if (role === 'pharmacist') {
        return category.includes('MEDICINE') || alertType.includes('MEDICINE') || /medicine|stock|inventory|pharmacy|drug|supply/i.test(messageText);
      }

      return false;
    });
};

export const getAlertCount = async () => {
  return await apiClient("/alerts/count");
};

export const generateAlerts = async () => {
  return await apiClient("/alerts/generate", {
    method: "POST",
  });
};