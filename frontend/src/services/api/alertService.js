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

const isMeaningfulAlertEntry = (alert = {}) => {
  const text = `${alert.title || ''} ${alert.description || ''} ${alert.message || ''} ${alert.Alert_Message || ''} ${alert.Alert_Title || ''}`.toLowerCase();
  const category = `${alert.category || ''} ${alert.Alert_Category || ''}`.toLowerCase();

  if (!text.trim()) return false;
  if (/new patient|patient added|patient updated|patient registered|registered by|updated their profile|profile updated|prescription saved|prescription added|prescription updated|added to inventory|medicine added|updated by|recorded in system|dispensed/.test(text)) {
    return false;
  }

  const isMedicine = /medicine|stock|inventory|expiry|expired|low stock|out of stock/.test(text) || /medicine/.test(category);
  const isDisease = /disease|outbreak|forecast|risk|clinical disease alert|diagnosed with/.test(text) || /disease/.test(category);

  return isMedicine || isDisease;
};

const normalizeAlert = (alert = {}, fallbackRole = '') => {
  const title = alert.title || alert.Alert_Title || alert.message || alert.Alert_Message || 'System Alert';
  const description = alert.description || alert.Description || alert.message || alert.Alert_Message || 'No alert details provided.';
  const role = alert.role || alert.Role || fallbackRole || (
    (alert.Alert_Category || alert.category || '').toString().toUpperCase().includes('MEDICINE') ? 'pharmacist' :
    (alert.Alert_Category || alert.category || '').toString().toUpperCase().includes('DISEASE') ? 'doctor' :
    'hospitalStaff'
  );

  const routeForRole = {
    doctor: '/doctor/alerts',
    hospitalStaff: '/hospital/alerts',
    pharmacist: '/pharmacist/alerts',
    admin: '/admin/alerts'
  };

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
    link: alert.link || alert.Link || alert.path || alert.Path || routeForRole[role] || '/doctor/alerts',
    raw: alert,
    seen: Boolean(alert.seen || alert.notificationRead)
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
    .filter((alert) => {
      if (!isMeaningfulAlertEntry(alert)) return false;
      // Do not show alerts that have already been seen/read in the notification bell
      if (alert.seen || alert.notificationRead) return false;

      const dateText = alert.date || alert.Alert_Date || alert.created_at || alert.Created_At || alert.timestamp || alert.Timestamp || '';
      if (dateText) {
        const alertTime = new Date(dateText.replace(' ', 'T')).getTime();
        if (!Number.isNaN(alertTime) && Date.now() - alertTime > 30 * 24 * 60 * 60 * 1000) {
          return false;
        }
      }

      return true;
    })
    .map((alert) => normalizeAlert(alert, role))
    .filter((alert) => {
      const alertRole = alert.role?.toLowerCase();
      const messageText = `${alert.title} ${alert.description}`.toLowerCase();
      const category = (alert.category || '').toString().toUpperCase();
      const alertType = (alert.alert_type || '').toString().toUpperCase();
      const isMedicine = category.includes('MEDICINE') || alertType.includes('MEDICINE') || /medicine|stock|inventory|expiry|out of stock|low stock/.test(messageText);
      const isDisease = category.includes('DISEASE') || alertType.includes('DISEASE') || /disease|outbreak|forecast|risk|clinical disease alert|diagnosed with/.test(messageText);

      if (!isMedicine && !isDisease) return false;
      if (alertRole === role) return true;

      if (role === 'admin') {
        return true;
      }

      if (role === 'doctor') {
        return isDisease || isMedicine;
      }

      if (role === 'hospitalStaff') {
        return isDisease;
      }

      if (role === 'pharmacist') {
        return isMedicine;
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