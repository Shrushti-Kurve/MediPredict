import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaBell } from 'react-icons/fa';
import { getLoggedInUser } from '../../services/localStorageService';
import { getRoleAlerts } from '../../services/api/alertService';
import logo from '../../assets/logo/logo.png';
import './DashboardHeader.css';

const DashboardHeader = ({ title, toggleSidebar }) => {
  const user = getLoggedInUser();
  const displayName = user?.name?.trim() || 'Doctor';
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleLabel = (role) => {
    if (role === 'doctor') return 'Doctor';
    if (role === 'hospitalStaff') return 'Hospital Staff';
    if (role === 'pharmacist') return 'Pharmacist';
    return role;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const getProfilePath = () => {
    if (!user) return '/';
    if (user.role === 'hospitalStaff') return '/hospital/profile';
    return `/${user.role}/profile`;
  };

  const roleWelcomeText = useMemo(() => {
    if (!user) return 'Welcome, Doctor';
    if (user.role === 'doctor') return `Welcome, Dr. ${displayName}`;
    return `Welcome, ${displayName}`;
  }, [displayName, user]);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      if (!user?.role) {
        setNotifications([]);
        return;
      }

      try {
        const alerts = await getRoleAlerts(user.role);
        if (isMounted) {
          setNotifications(alerts.slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
        if (isMounted) setNotifications([]);
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const notificationCount = notifications.length;

  return (
    <header className="dashboard-header">
      <div className="db-header-left">
        <button className="db-sidebar-toggle" onClick={() => toggleSidebar && toggleSidebar(true)} aria-label="Open Sidebar">
          <FaBars />
        </button>

        <Link to="/" className="db-header-logo-link" aria-label="Go to home page">
          <img src={logo} alt="MediPredict Logo" className="db-header-logo" />
        </Link>

        <div className="db-header-title-stack">
          <span className="db-header-welcome">{roleWelcomeText}</span>
          {title ? <h1 className="db-header-title">{title}</h1> : null}
        </div>
      </div>
      
      <div className="db-header-right">
        {user && (
          <div className="db-notification-wrapper" ref={notificationRef}>
            <button
              type="button"
              className="db-notification-button"
              aria-label="Toggle alerts"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <FaBell />
              {notificationCount > 0 && <span className="db-notification-count">{notificationCount}</span>}
            </button>

            {showNotifications && (
              <div className="db-notification-panel">
                <div className="db-notification-header">
                  <span>Alerts</span>
                  <span className="db-notification-total">{notificationCount}</span>
                </div>
                <div className="db-notification-list">
                  {notifications.length > 0 ? (
                    notifications.map((alert) => (
                      <div key={alert.id} className="db-notification-item">
                        <div className={`db-notification-dot db-notification-${alert.severity.toLowerCase()}`} />
                        <div className="db-notification-copy">
                          <strong>{alert.title}</strong>
                          <p>{alert.description}</p>
                          <span>{alert.date || 'Recent update'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="db-notification-empty">No new alerts.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {user && (
          <div className="db-user-profile-menu">
            <Link to={getProfilePath()} className="db-profile-link">
              <div className="db-user-avatar">
                {getInitials(user.name)}
              </div>
              <div className="db-user-info">
                <span className="db-user-name">{user.name}</span>
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
