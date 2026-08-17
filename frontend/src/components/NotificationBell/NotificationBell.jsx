// import React, { useEffect, useState } from "react";
// import { FaBell } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { getLoggedInUser } from "../../services/localStorageService";
// import { getAlertCount, ackAllAlerts } from "../../services/api/alertService";
// import "./NotificationBell.css";

// const NotificationBell = () => {

//   const user = getLoggedInUser();
//   const navigate = useNavigate();

//   const [count, setCount] = useState(0);

//   const getAlertPage = () => {

//     if (!user) return "/";

//     if (user.role === "doctor") {
//       return "/doctor/alerts";
//     }

//     if (user.role === "hospitalStaff") {
//       return "/hospital/alerts";
//     }

//     if (user.role === "pharmacist") {
//       return "/pharmacist/alerts";
//     }

//     return "/alerts";
//   };

//   const loadCount = async () => {

//     try {

//       try {
//         const res = await getAlertCount();
//         const c = res?.count || 0;
//         setCount(Number(c));
//       } catch (e) {
//         console.error('Notification count error:', e);
//       }

//     } catch (error) {

//       console.error(
//         "Notification count error:",
//         error
//       );

//     }

//   };

//   useEffect(() => {

//     if (!user) return;

//     loadCount();

//     const interval = setInterval(
//       loadCount,
//       5000
//     );

//     return () => clearInterval(interval);

//   }, [user?.role]);

//   useEffect(() => {
//     const handler = () => setCount(0);
//     window.addEventListener('alerts:acknowledged', handler);
//     return () => window.removeEventListener('alerts:acknowledged', handler);
//   }, []);

//   if (!user) return null;

//   return (

//     <button
//       className="home-notification-button"
//       onClick={async () => {
//         // acknowledge alerts so bell clears immediately
//         try {
//           await ackAllAlerts();
//           try { window.dispatchEvent(new CustomEvent('alerts:acknowledged')); } catch (e) {}
//         } catch (e) {
//           /* ignore */
//         }

//         setCount(0);
//         navigate(getAlertPage());
//       }}
//       title="View alerts"
//     >

//       <FaBell />

//       {count > 0 && (

//         <span className="home-notification-count">
//           {count > 99 ? "99+" : count}
//         </span>

//       )}

//     </button>

//   );

// };

// export default NotificationBell;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationBell.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function NotificationBell() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------
  // GET ALERTS FROM DATABASE
  // ---------------------------------------------------------

  const loadAlerts = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/alerts/`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log("NOTIFICATION ALERT DATA:", data);

      let alertList = [];

      // Backend may return an array directly
      if (Array.isArray(data)) {
        alertList = data;
      }

      // Or { alerts: [...] }
      else if (Array.isArray(data?.alerts)) {
        alertList = data.alerts;
      }

      // Or { data: [...] }
      else if (Array.isArray(data?.data)) {
        alertList = data.data;
      }

      // -----------------------------------------------------
      // NORMALIZE DATABASE ALERTS
      // -----------------------------------------------------

      const normalized = alertList.map((alert, index) => ({
        id:
          alert.Alert_ID ??
          alert.alert_id ??
          alert.id ??
          index,

        disease:
          alert.Disease ??
          alert.disease ??
          "System Alert",

        village:
          alert.Village ??
          alert.village ??
          "",

        type:
          alert.Alert_Type ??
          alert.alert_type ??
          "ALERT",

        severity:
          alert.Severity ??
          alert.severity ??
          "LOW",

        category:
          alert.Alert_Category ??
          alert.alert_category ??
          "SYSTEM",

        message:
          alert.Alert_Message ??
          alert.alert_message ??
          alert.Message ??
          alert.message ??
          "New system alert",

        date:
          alert.Alert_Date ??
          alert.alert_date ??
          alert.Created_At ??
          alert.created_at ??
          ""
      }));

      setAlerts(normalized);

    } catch (error) {
      console.error("Failed to load alerts:", error);

      // IMPORTANT:
      // Do NOT replace database alerts with dummy alerts.
      setAlerts([]);

    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // LOAD WHEN COMPONENT STARTS
  // ---------------------------------------------------------

  useEffect(() => {
    loadAlerts();

    // Refresh alerts every 5 seconds
    const interval = setInterval(() => {
      loadAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ---------------------------------------------------------
  // OPEN BELL
  // ---------------------------------------------------------

  const handleBellClick = async () => {
    setIsOpen((previous) => !previous);

    if (!isOpen) {
      await loadAlerts();
    }
  };

  // ---------------------------------------------------------
  // VIEW ALL ALERTS
  // ---------------------------------------------------------

  const handleViewAll = () => {
    setIsOpen(false);

    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    const role = String(
      user.role ||
      user.Role ||
      user.User_Role ||
      user.user_role ||
      ""
    ).toLowerCase();

    console.log("Current user role:", role);

    if (
      role.includes("doctor")
    ) {
      navigate("/doctor/alerts");
      return;
    }

    if (
      role.includes("pharmacist") ||
      role.includes("pharmacy")
    ) {
      navigate("/pharmacist/alerts");
      return;
    }

    if (
      role.includes("staff") ||
      role.includes("hospital") ||
      role.includes("admin")
    ) {
      navigate("/hospital/alerts");
      return;
    }

    // Default
    navigate("/hospital/alerts");
  };

  // ---------------------------------------------------------
  // CLICK INDIVIDUAL ALERT
  // ---------------------------------------------------------

  const handleAlertClick = () => {
    setIsOpen(false);
    handleViewAll();
  };

  return (
    <div className="notification-wrapper">

      {/* =====================================================
          BELL
      ===================================================== */}

      <button
        className="notification-bell-button"
        onClick={handleBellClick}
        type="button"
        aria-label="Notifications"
      >

        <span className="notification-bell-icon">
          🔔
        </span>

        {alerts.length > 0 && (
          <span className="notification-count">
            {alerts.length > 99 ? "99+" : alerts.length}
          </span>
        )}

      </button>


      {/* =====================================================
          POPUP
      ===================================================== */}

      {isOpen && (
        <div className="notification-popup">

          {/* HEADER */}

          <div className="notification-popup-header">

            <div>
              <h2>Alerts</h2>

              <p>
                Important system notifications
              </p>
            </div>

            <span className="notification-header-count">
              {alerts.length}
            </span>

          </div>


          {/* =================================================
              ALERT LIST
          ================================================= */}

          <div className="notification-list">

            {loading && alerts.length === 0 ? (

              <div className="notification-empty">
                <div className="notification-loading">
                  Loading alerts...
                </div>
              </div>

            ) : alerts.length === 0 ? (

              <div className="notification-empty">

                <div className="notification-empty-icon">
                  🔔
                </div>

                <h3>No alerts</h3>

                <p>
                  There are currently no alerts in the system.
                </p>

              </div>

            ) : (

              alerts.slice(0, 8).map((alert) => (

                <button
                  key={alert.id}
                  className={`notification-item severity-${String(
                    alert.severity
                  ).toLowerCase()}`}
                  onClick={handleAlertClick}
                  type="button"
                >

                  <div className="notification-item-top">

                    <strong>
                      {alert.disease}
                    </strong>

                    <span className="notification-severity">
                      {alert.severity}
                    </span>

                  </div>


                  <div className="notification-item-message">

                    {alert.message}

                  </div>


                  <div className="notification-item-details">

                    {alert.village && (
                      <span>
                        📍 {alert.village}
                      </span>
                    )}

                    {alert.type && (
                      <span>
                        {alert.type}
                      </span>
                    )}

                  </div>

                </button>

              ))

            )}

          </div>


          {/* =================================================
              VIEW ALL
          ================================================= */}

          {alerts.length > 0 && (

            <div className="notification-popup-footer">

              <button
                type="button"
                className="view-all-alerts-button"
                onClick={handleViewAll}
              >
                View All Alerts →
              </button>

            </div>

          )}

        </div>
      )}

    </div>
  );
}

export default NotificationBell;