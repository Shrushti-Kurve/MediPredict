import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaUser, FaBell } from 'react-icons/fa';
import { getLoggedInUser, logout } from '../../services/localStorageService';
import NotificationBell from "../NotificationBell/NotificationBell";
import { getAlerts, getAlertCount, dismissAlert, ackAllAlerts } from '../../services/api/alertService';
import logo from '../../assets/logo/logo.png';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const user = getLoggedInUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const notificationRef = useRef(null);

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'doctor') return '/doctor/dashboard';
    if (user.role === 'hospitalStaff') return '/hospital/dashboard';
    if (user.role === 'pharmacist') return '/pharmacist/dashboard';
    return '/';
  };

  const getAlertPath = () => {
    if (!user) return '/';
    if (user.role === 'doctor') return '/doctor/alerts';
    if (user.role === 'hospitalStaff') return '/hospital/alerts';
    if (user.role === 'pharmacist') return '/pharmacist/alerts';
    return '/alerts';
  };

  useEffect(() => {
    let mounted = true;

    const loadCount = async () => {
      try {
        const res = await getAlertCount();
        if (!mounted) return;
        setAlertCount(res?.count || 0);
      } catch (e) {
        if (!mounted) return;
        setAlertCount(0);
      }
    };

    loadCount();
    const t = setInterval(loadCount, 8000);
    return () => { mounted = false; clearInterval(t); };
  }, [user?.role]);

  const loadHomeNotifications = async () => {
    try {
      const data = await getAlerts();
      const important = (Array.isArray(data) ? data : [])
        .filter(a => ['HIGH','MEDIUM'].includes(String(a.Severity || '').toUpperCase()))
        .slice(0,6);
      setNotifications(important);
    } catch (e) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadHomeNotifications();
    const id = setInterval(loadHomeNotifications, 10000);
    return () => clearInterval(id);
  }, [user?.role]);

  useEffect(() => {
    const onDocClick = (ev) => {
      if (notificationRef.current && !notificationRef.current.contains(ev.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const handler = () => setAlertCount(0);
    window.addEventListener('alerts:acknowledged', handler);
    return () => window.removeEventListener('alerts:acknowledged', handler);
  }, []);

  const handleOpen = async () => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    if (opening) {
      // mark read and clear local preview
      try { await ackAllAlerts(); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('alerts:acknowledged')); } catch (e) {}
      setNotifications([]);
      setAlertCount(0);
    }
  };

  const handleClickAlert = async (alert) => {
    try { await dismissAlert(alert.Alert_ID); } catch (e) {}
    setNotifications(prev => prev.filter(a => a.Alert_ID !== alert.Alert_ID));
    try {
      const res = await getAlertCount();
      setAlertCount(res?.count || 0);
    } catch (e) {
      setAlertCount(c => Math.max(0, c - 1));
    }
    try { window.dispatchEvent(new CustomEvent('alerts:acknowledged')); } catch (e) {}
    navigate(getAlertPath());
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="container header-container">
        <Link to="/" className="header-logo-container" onClick={() => setMobileMenuOpen(false)}>
          <img src={logo} alt="MediPredict Logo" className="header-logo" />
          <div className="header-title-wrapper">
            <span className="header-title">MediPredict</span>
            <span className="header-subtitle">Rural Healthcare System</span>
          </div>
        </Link>

        <nav className="desktop-nav">
          <a href="#hero" className="nav-link">Home</a>
          <a href="#usp" className="nav-link">USP</a>
          <a href="#roles" className="nav-link">Roles</a>
          <a href="#connect" className="nav-link">Connect</a>
        </nav>

        {user && (
          <div className="home-notification-wrapper" ref={notificationRef}>
            <button className="home-notification-button" onClick={handleOpen} aria-label="View alerts">
              <FaBell />
              {alertCount > 0 && <span className="home-notification-count">{alertCount}</span>}
            </button>

            {showNotifications && (
              <div className="home-notification-panel">
                <div className="home-notification-header">
                  <div>
                    <strong>Alerts</strong>
                    <span>Important system notifications</span>
                  </div>
                  <span className="home-notification-total">{alertCount}</span>
                </div>

                <div className="home-notification-list">
                  {notifications.length > 0 ? (
                    notifications.map(alert => (
                      <button key={alert.Alert_ID} className="home-notification-item" onClick={() => handleClickAlert(alert)}>
                        <span className={`home-notification-dot ${String(alert.Severity || 'MEDIUM').toUpperCase() === 'HIGH' ? 'high' : 'medium'}`} />
                        <div className="home-notification-content">
                          <strong>{alert.Alert_Type?.replaceAll('_',' ') || 'System Alert'}</strong>
                          <p>{alert.Alert_Message}</p>
                          <small>{alert.Alert_Date ? new Date(alert.Alert_Date).toLocaleString() : 'Recent'}</small>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="home-notification-empty"><FaBell /><p>No important alerts</p></div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <button type="button" className="home-view-alerts" onClick={() => { try { ackAllAlerts(); } catch (e) {} try { window.dispatchEvent(new CustomEvent('alerts:acknowledged')); } catch (e) {} navigate(getAlertPath()); }}>
                    View all alerts →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="desktop-auth-buttons">
          {user ? (
            <>
              <Link to={getDashboardPath()} className="btn btn-secondary auth-dashboard-btn"><FaUser /> Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-danger auth-logout-btn"><FaSignOutAlt /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary login-nav-btn">Login</Link>
              <Link to="/signup" className="btn btn-primary signup-nav-btn">Sign Up</Link>
            </>
          )}
        </div>

        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-nav">
            <a href="#hero" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#usp" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>USP</a>
            <a href="#roles" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Roles</a>
            <a href="#connect" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Connect</a>
            <NotificationBell />

            <div className="mobile-auth-section">
              {user ? (
                <>
                  <Link to={getDashboardPath()} className="btn btn-secondary mobile-auth-btn" onClick={() => setMobileMenuOpen(false)}><FaUser /> Dashboard</Link>
                  <button onClick={handleLogout} className="btn btn-danger mobile-auth-btn"> <FaSignOutAlt /> Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-secondary mobile-auth-btn" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/signup" className="btn btn-primary mobile-auth-btn" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
