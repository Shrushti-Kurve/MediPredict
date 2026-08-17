// import apiClient from "./apiClient";

// const normalizeAlertSeverity = (alert = {}) => {
//   const rawValue = [alert.severity, alert.Severity, alert.type, alert.Type, alert.alert_type, alert.Alert_Type]
//     .find(value => value !== undefined && value !== null && value !== '')
//     ?.toString()
//     .toUpperCase() || '';

//   if (/CRITICAL|URGENT|HIGH|DANGER|RED/.test(rawValue)) return 'Critical';
//   if (/WARNING|ATTENTION|MEDIUM|YELLOW/.test(rawValue)) return 'Warning';
//   return 'Info';
// };

// const normalizeAlert = (alert = {}, fallbackRole = '') => {
//   const title = alert.title || alert.Alert_Title || alert.message || alert.Alert_Message || 'System Alert';
//   const description = alert.description || alert.Description || alert.message || alert.Alert_Message || 'No alert details provided.';
//   const role = alert.role || alert.Role || fallbackRole || (
//     (alert.Alert_Category || alert.category || '').toString().toUpperCase().includes('MEDICINE') ? 'pharmacist' :
//     (alert.Alert_Category || alert.category || '').toString().toUpperCase().includes('DISEASE') ? 'doctor' :
//     'hospitalStaff'
//   );

//   return {
//     id: alert.id || alert.Alert_ID || `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
//     role,
//     title: title.toString().trim(),
//     description: description.toString().trim(),
//     message: description.toString().trim(),
//     type: normalizeAlertSeverity(alert),
//     severity: normalizeAlertSeverity(alert),
//     status: normalizeAlertSeverity(alert),
//     date: alert.date || alert.Alert_Date || alert.created_at || alert.Created_At || alert.timestamp || alert.Timestamp || '',
//     category: alert.category || alert.Alert_Category || '',
//     alert_type: alert.alert_type || alert.Alert_Type || '',
//     raw: alert
//   };
// };

// export const getAlerts = async () => {
//   return await apiClient("/alerts/").catch(() => {
//     try {
//       return JSON.parse(localStorage.getItem('alerts') || '[]');
//     } catch {
//       return [];
//     }
//   });
// };

// export const getRoleAlerts = async (role) => {
//   const rawAlerts = await getAlerts();
//   const sourceAlerts = Array.isArray(rawAlerts) ? rawAlerts : [];

//   return sourceAlerts
//     .map((alert) => normalizeAlert(alert, role))
//     .filter((alert) => {
//       const alertRole = alert.role?.toLowerCase();
//       const messageText = `${alert.title} ${alert.description}`.toLowerCase();
//       const category = (alert.category || '').toString().toUpperCase();
//       const alertType = (alert.alert_type || '').toString().toUpperCase();

//       if (alertRole === role) return true;

//       if (role === 'doctor') {
//         return category.includes('DISEASE') || alertType.includes('DISEASE') || /patient|condition|diagnosis|critical|follow-up/i.test(messageText);
//       }

//       if (role === 'hospitalStaff') {
//         return category.includes('DISEASE') || category.includes('PATIENT') || alertType.includes('DISEASE') || /patient|admission|record|status|follow-up|hospital/i.test(messageText);
//       }

//       if (role === 'pharmacist') {
//         return category.includes('MEDICINE') || alertType.includes('MEDICINE') || /medicine|stock|inventory|pharmacy|drug|supply/i.test(messageText);
//       }

//       return false;
//     });
// };

// export const getAlertCount = async () => {
//   return await apiClient("/alerts/count");
// };

// export const generateAlerts = async () => {
//   return await apiClient("/alerts/generate", {
//     method: "POST",
//   });
// };

// export const ackAllAlerts = async () => {
//   return await apiClient('/alerts/ack_all', { method: 'POST' }).catch(() => null);
// };

// export const dismissAlert = async (alertId) => {
//   if (!alertId) return null;
//   return await apiClient(`/alerts/${alertId}/dismiss`, { method: 'PUT' }).catch(() => null);
// };

import apiClient from "./apiClient";

/*
=========================================================
NORMALIZE ALERT SEVERITY
=========================================================

IMPORTANT:
Keep the original database values:

HIGH
MEDIUM
LOW

Do NOT convert HIGH to Critical or MEDIUM to Warning.
The frontend notification system depends on these values.
=========================================================
*/

const normalizeAlertSeverity = (alert = {}) => {
  const rawValue = [
    alert.severity,
    alert.Severity,
    alert.risk_level,
    alert.Risk_Level,
    alert.type,
    alert.Type,
    alert.alert_type,
    alert.Alert_Type,
  ].find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

  const value = rawValue
    ? rawValue.toString().trim().toUpperCase()
    : "";

  if (
    value.includes("HIGH") ||
    value.includes("CRITICAL") ||
    value.includes("URGENT") ||
    value.includes("DANGER") ||
    value.includes("RED")
  ) {
    return "HIGH";
  }

  if (
    value.includes("MEDIUM") ||
    value.includes("WARNING") ||
    value.includes("ATTENTION") ||
    value.includes("YELLOW")
  ) {
    return "MEDIUM";
  }

  return "LOW";
};


/*
=========================================================
NORMALIZE ALERT
=========================================================
*/

const normalizeAlert = (
  alert = {},
  fallbackRole = ""
) => {

  const category = (
    alert.Alert_Category ||
    alert.alert_category ||
    alert.category ||
    ""
  )
    .toString()
    .trim()
    .toUpperCase();


  const alertType = (
    alert.Alert_Type ||
    alert.alert_type ||
    alert.type ||
    ""
  )
    .toString()
    .trim()
    .toUpperCase();


  /*
  -------------------------------------------------------
  TITLE
  -------------------------------------------------------
  */

  let title =
    alert.title ||
    alert.Alert_Title ||
    alert.Title;


  if (!title) {

    if (
      category.includes("DISEASE") ||
      alertType.includes("DISEASE")
    ) {
      title = "Disease Forecast Alert";
    }

    else if (
      category.includes("MEDICINE") ||
      alertType.includes("MEDICINE")
    ) {
      title = "Medicine Stock Alert";
    }

    else {
      title = "System Alert";
    }
  }


  /*
  -------------------------------------------------------
  DESCRIPTION
  -------------------------------------------------------
  */

  const description =
    alert.Alert_Message ||
    alert.alert_message ||
    alert.message ||
    alert.Message ||
    alert.description ||
    alert.Description ||
    "Important alert generated by MediPredict.";


  /*
  -------------------------------------------------------
  ROLE
  -------------------------------------------------------
  */

  let role =
    alert.role ||
    alert.Role ||
    fallbackRole;


  if (!role) {

    if (
      category.includes("MEDICINE") ||
      alertType.includes("MEDICINE")
    ) {
      role = "pharmacist";
    }

    else if (
      category.includes("DISEASE") ||
      alertType.includes("DISEASE")
    ) {
      role = "doctor";
    }

    else {
      role = "hospitalStaff";
    }
  }


  /*
  -------------------------------------------------------
  DATE
  -------------------------------------------------------
  */

  const date =
    alert.Alert_Date ||
    alert.alert_date ||
    alert.date ||
    alert.created_at ||
    alert.Created_At ||
    alert.timestamp ||
    alert.Timestamp ||
    "";


  /*
  -------------------------------------------------------
  ID
  -------------------------------------------------------
  */

  const id =
    alert.Alert_ID ??
    alert.alert_id ??
    alert.id ??
    `${role}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;


  /*
  -------------------------------------------------------
  SEVERITY
  -------------------------------------------------------
  */

  const severity = normalizeAlertSeverity(alert);


  return {

    id: String(id),

    role,

    title: title
      .toString()
      .trim(),

    description: description
      .toString()
      .trim(),

    message: description
      .toString()
      .trim(),

    severity,

    /*
      Keep these aliases because different pages
      may use different names.
    */

    type: severity,

    status: severity,

    date,

    category,

    alert_type: alertType,

    /*
      Keep original database object.
    */

    raw: alert
  };
};


/*
=========================================================
GET ALL ALERTS
=========================================================
*/

export const getAlerts = async () => {

  try {

    const response = await apiClient("/alerts/");

    if (Array.isArray(response)) {
      return response;
    }

    /*
      Some APIs return:
      { alerts: [...] }
    */

    if (
      response &&
      Array.isArray(response.alerts)
    ) {
      return response.alerts;
    }


    /*
      Some APIs return:
      { data: [...] }
    */

    if (
      response &&
      Array.isArray(response.data)
    ) {
      return response.data;
    }


    return [];

  } catch (error) {

    console.error(
      "Failed to load alerts:",
      error
    );

    /*
      Do not crash the dashboard.
    */

    try {

      const localAlerts =
        JSON.parse(
          localStorage.getItem("alerts") || "[]"
        );

      return Array.isArray(localAlerts)
        ? localAlerts
        : [];

    } catch {

      return [];
    }
  }
};


/*
=========================================================
GET ALERTS FOR ROLE
=========================================================
*/

export const getRoleAlerts = async (role) => {

  const rawAlerts = await getAlerts();

  if (!Array.isArray(rawAlerts)) {
    return [];
  }


  const normalizedAlerts = rawAlerts
    .map((alert) =>
      normalizeAlert(alert, role)
    );


  /*
  -------------------------------------------------------
  ROLE FILTER
  -------------------------------------------------------
  */

  const filteredAlerts =
    normalizedAlerts.filter((alert) => {

      const alertRole =
        alert.role
          ?.toString()
          .toLowerCase();


      const messageText =
        `${alert.title} ${alert.description}`
          .toLowerCase();


      const category =
        (alert.category || "")
          .toString()
          .toUpperCase();


      const alertType =
        (alert.alert_type || "")
          .toString()
          .toUpperCase();


      /*
      ---------------------------------------------------
      DOCTOR
      ---------------------------------------------------
      */

      if (role === "doctor") {

        return (
          alertRole === "doctor" ||

          category.includes("DISEASE") ||

          alertType.includes("DISEASE") ||

          /disease|forecast|patient|diagnosis|outbreak|risk/i
            .test(messageText)
        );
      }


      /*
      ---------------------------------------------------
      HOSPITAL STAFF
      ---------------------------------------------------
      */

      if (role === "hospitalStaff") {

        return (
          alertRole === "hospitalstaff" ||

          category.includes("DISEASE") ||

          category.includes("PATIENT") ||

          alertType.includes("DISEASE") ||

          /disease|forecast|patient|outbreak|hospital|admission/i
            .test(messageText)
        );
      }


      /*
      ---------------------------------------------------
      PHARMACIST
      ---------------------------------------------------
      */

      if (role === "pharmacist") {

        return (
          alertRole === "pharmacist" ||

          category.includes("MEDICINE") ||

          category.includes("STOCK") ||

          alertType.includes("MEDICINE") ||

          /medicine|stock|inventory|pharmacy|drug|supply/i
            .test(messageText)
        );
      }


      return false;
    });


  /*
  -------------------------------------------------------
  SORT NEWEST FIRST
  -------------------------------------------------------
  */

  return filteredAlerts.sort(
    (a, b) => {

      const dateA =
        new Date(a.date || 0).getTime();

      const dateB =
        new Date(b.date || 0).getTime();

      return dateB - dateA;
    }
  );
};


/*
=========================================================
GET ALERT COUNT
=========================================================
*/

export const getAlertCount = async () => {

  try {

    return await apiClient(
      "/alerts/count"
    );

  } catch (error) {

    console.error(
      "Failed to get alert count:",
      error
    );

    return 0;
  }
};


/*
=========================================================
GENERATE ALERTS
=========================================================
*/

export const generateAlerts = async () => {

  return await apiClient(
    "/alerts/generate",
    {
      method: "POST"
    }
  );
};


/*
=========================================================
ACKNOWLEDGE ALL
=========================================================
*/

export const ackAllAlerts = async () => {

  try {

    return await apiClient(
      "/alerts/ack_all",
      {
        method: "POST"
      }
    );

  } catch (error) {

    console.error(
      "Failed to acknowledge alerts:",
      error
    );

    return null;
  }
};


/*
=========================================================
DISMISS ALERT
=========================================================
*/

export const dismissAlert = async (
  alertId
) => {

  if (!alertId) {
    return null;
  }

  try {

    return await apiClient(
      `/alerts/${alertId}/dismiss`,
      {
        method: "PUT"
      }
    );

  } catch (error) {

    console.error(
      "Failed to dismiss alert:",
      error
    );

    return null;
  }
};