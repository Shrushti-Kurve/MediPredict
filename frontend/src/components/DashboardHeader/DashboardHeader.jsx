import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaBell } from 'react-icons/fa';
import { getLoggedInUser } from '../../services/localStorageService';
import { getRoleAlerts } from '../../services/api/alertService';
import logo from '../../assets/logo/logo.png';
import './DashboardHeader.css';

const DashboardHeader = ({ title, toggleSidebar }) => {
  const user = getLoggedInUser();
  const navigate = useNavigate();

  const displayName = user?.name?.trim() || 'User';

  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem('medipredict_dismissed_alerts') || '[]'
      );
    } catch {
      return [];
    }
  });

  const getRoleLabel = (role) => {
    if (role === 'doctor') return 'Doctor';
    if (role === 'hospitalStaff') return 'Hospital Staff';
    if (role === 'pharmacist') return 'Pharmacist';
    return role || 'User';
  };

  const getInitials = (name) => {
    if (!name) return 'U';

    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getProfilePath = () => {
    if (!user) return '/';

    if (user.role === 'hospitalStaff') {
      return '/hospital/profile';
    }

    return `/${user.role}/profile`;
  };

  const roleWelcomeText = useMemo(() => {
    if (!user) return 'Welcome';

    if (user.role === 'doctor') {
      return `Welcome, Dr. ${displayName}`;
    }

    return `Welcome, ${displayName}`;
  }, [displayName, user]);

  /*
   =========================================================
   LOAD REAL ALERTS FROM DATABASE
   =========================================================
  */

  const loadNotifications = async () => {
    if (!user?.role) {
      setNotifications([]);
      return;
    }

    try {
      const alerts = await getRoleAlerts(user.role);

      const realAlerts = Array.isArray(alerts) ? alerts : [];

      /*
        Only HIGH and MEDIUM alerts appear in notification bell.
        LOW alerts stay out of the bell.
      */

      const importantAlerts = realAlerts.filter((alert) => {
        const severity = String(
          alert.severity ||
          alert.Severity ||
          alert.risk_level ||
          alert.Risk_Level ||
          ''
        ).toUpperCase();

        return severity === 'HIGH' || severity === 'MEDIUM';
      });

      /*
        Remove notifications already clicked by this browser session.
      */

      const visibleAlerts = importantAlerts.filter((alert) => {
        const id =
          alert.id ??
          alert.Alert_ID ??
          alert.alert_id;

        return !dismissedIds.includes(String(id));
      });

      setNotifications(visibleAlerts.slice(0, 10));

    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    }
  };

  /*
   =========================================================
   LOAD ON LOGIN + CHECK FOR NEW PREDICTIONS
   =========================================================
  */

  useEffect(() => {
    loadNotifications();

    /*
      Check database every 5 seconds.
      Therefore when prediction creates a new alert,
      the bell gets updated automatically.
    */

    const interval = setInterval(() => {
      loadNotifications();
    }, 5000);

    return () => clearInterval(interval);

  }, [user?.role, dismissedIds]);

  /*
   =========================================================
   CLOSE POPUP WHEN CLICKING OUTSIDE
   =========================================================
  */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  /*
   =========================================================
   FORMAT ALERT
   =========================================================
  */

  const getAlertId = (alert) =>
    String(
      alert.id ??
      alert.Alert_ID ??
      alert.alert_id
    );

  const getSeverity = (alert) =>
    String(
      alert.severity ||
      alert.Severity ||
      alert.risk_level ||
      alert.Risk_Level ||
      'MEDIUM'
    ).toLowerCase();

  const getAlertTitle = (alert) => {

    /*
      Disease forecast
    */

    if (
      alert.Alert_Category === 'DISEASE' ||
      alert.Alert_Category === 'Disease' ||
      alert.alert_category === 'DISEASE' ||
      alert.category === 'DISEASE' ||
      alert.Disease ||
      alert.disease
    ) {
      return 'Disease Forecast Alert';
    }

    /*
      Medicine alert
    */

    if (
      alert.Alert_Category === 'MEDICINE' ||
      alert.Alert_Category === 'Medicine' ||
      alert.alert_category === 'MEDICINE' ||
      alert.category === 'MEDICINE' ||
      alert.Medicine_Name ||
      alert.medicine
    ) {
      return 'Medicine Alert';
    }

    return 'System Alert';
  };

  const getAlertDescription = (alert) => {

    return (
      alert.Alert_Message ||
      alert.alert_message ||
      alert.message ||
      alert.description ||
      'Important alert generated by MediPredict.'
    );
  };

  const getAlertDate = (alert) => {

    return (
      alert.Alert_Date ||
      alert.alert_date ||
      alert.date ||
      'Recent'
    );
  };

  /*
   =========================================================
   CLICK NOTIFICATION
   =========================================================
  */

  const handleNotificationClick = (alert) => {

    const id = getAlertId(alert);

    /*
      Remove from bell popup.
    */

    const updatedDismissed = [
      ...dismissedIds,
      id
    ];

    setDismissedIds(updatedDismissed);

    sessionStorage.setItem(
      'medipredict_dismissed_alerts',
      JSON.stringify(updatedDismissed)
    );

    setNotifications((prev) =>
      prev.filter((item) => getAlertId(item) !== id)
    );

    /*
      Close popup.
    */

    setShowNotifications(false);

    /*
      Navigate to alerts page.
    */

    if (user?.role === 'doctor') {
      navigate('/doctor/alerts');
    } else if (user?.role === 'hospitalStaff') {
      navigate('/hospital/alerts');
    } else if (user?.role === 'pharmacist') {
      navigate('/pharmacist/alerts');
    } else {
      navigate('/alerts');
    }
  };

  const notificationCount = notifications.length;

  return (
    <header className="dashboard-header">

      {/* LEFT */}

      <div className="db-header-left">

        <button
          className="db-sidebar-toggle"
          onClick={() =>
            toggleSidebar && toggleSidebar(true)
          }
          aria-label="Open Sidebar"
        >
          <FaBars />
        </button>

        <Link
          to="/"
          className="db-header-logo-link"
          aria-label="Go to home page"
        >
          <img
            src={logo}
            alt="MediPredict Logo"
            className="db-header-logo"
          />
        </Link>

        <div className="db-header-title-stack">

          <span className="db-header-welcome">
            {roleWelcomeText}
          </span>

          {title && (
            <h1 className="db-header-title">
              {title}
            </h1>
          )}

        </div>

      </div>

      {/* RIGHT */}

      <div className="db-header-right">

        {user && (

          <div
            className="db-notification-wrapper"
            ref={notificationRef}
          >

            {/* BELL */}

            <button
              type="button"
              className={`db-notification-button ${
                notificationCount > 0
                  ? 'has-notifications'
                  : ''
              }`}
              aria-label="Toggle alerts"
              onClick={() =>
                setShowNotifications((prev) => !prev)
              }
            >

              <FaBell />

              {notificationCount > 0 && (
                <span className="db-notification-count">
                  {notificationCount > 99
                    ? '99+'
                    : notificationCount}
                </span>
              )}

            </button>

            {/* POPUP */}

            {showNotifications && (

              <div className="db-notification-panel">

                <div className="db-notification-header">

                  <div>
                    <strong>Important Alerts</strong>
                    <small>
                      Disease forecasts & medicine alerts
                    </small>
                  </div>

                  <span className="db-notification-total">
                    {notificationCount}
                  </span>

                </div>

                <div className="db-notification-list">

                  {notifications.length > 0 ? (

                    notifications.map((alert) => {

                      const severity =
                        getSeverity(alert);

                      return (

                        <button
                          key={getAlertId(alert)}
                          type="button"
                          className="db-notification-item"
                          onClick={() =>
                            handleNotificationClick(alert)
                          }
                        >

                          <div
                            className={`db-notification-dot db-notification-${severity}`}
                          />

                          <div className="db-notification-copy">

                            <strong>
                              {getAlertTitle(alert)}
                            </strong>

                            <p>
                              {getAlertDescription(alert)}
                            </p>

                            <span>
                              {getAlertDate(alert)}
                            </span>

                          </div>

                        </button>

                      );
                    })

                  ) : (

                    <div className="db-notification-empty">

                      <FaBell />

                      <p>
                        No new important alerts
                      </p>

                    </div>

                  )}

                </div>

              </div>

            )}

          </div>

        )}

        {/* USER */}

        {user && (

          <div className="db-user-profile-menu">

            <Link
              to={getProfilePath()}
              className="db-profile-link"
            >

              <div className="db-user-avatar">
                {getInitials(user.name)}
              </div>

              <div className="db-user-info">

                <span className="db-user-name">
                  {user.name}
                </span>

                <span className="badge badge-primary db-user-role-badge">
                  {getRoleLabel(user.role)}
                </span>

              </div>

            </Link>

          </div>

        )}

      </div>

    </header>
  );
};

export default DashboardHeader;