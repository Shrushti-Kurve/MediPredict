import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { getLoggedInUser, logout } from '../../services/localStorageService';
import { useEffect, useRef} from "react";
import { FaBell } from "react-icons/fa";
import { getAlerts } from "../../services/api/alertService";
import logo from '../../assets/logo/logo.png';
import NotificationBell from "../../components/NotificationBell/NotificationBell";
import './Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = getLoggedInUser();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'doctor') return '/doctor/dashboard';
    if (user.role === 'hospitalStaff') return '/hospital/dashboard';
    if (user.role === 'pharmacist') return '/pharmacist/dashboard';
    return '/';
  };


const notificationRef = useRef(null);

const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);

useEffect(() => {
  loadHomeNotifications();

  const interval = setInterval(() => {
    loadHomeNotifications();
  }, 10000);

  return () => clearInterval(interval);
}, []);

const loadHomeNotifications = async () => {
  try {
    const data = await getAlerts();

    const importantAlerts = (Array.isArray(data) ? data : [])
      .filter((alert) => {
        const severity = String(
          alert.Severity || ""
        ).toUpperCase();

        return severity === "HIGH" || severity === "MEDIUM";
      })
      .slice(0, 6);

    setNotifications(importantAlerts);

  } catch (error) {
    console.error("Failed to load home notifications:", error);
    setNotifications([]);
  }
};

useEffect(() => {
  const handleOutsideClick = (event) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setShowNotifications(false);
    }
  };

  document.addEventListener("mousedown", handleOutsideClick);

  return () => {
    document.removeEventListener(
      "mousedown",
      handleOutsideClick
    );
  };
}, []);

const openAlertPage = () => {
  setShowNotifications(false);
  navigate("/doctor/alerts");
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

        {/* Desktop Menu */}
        <nav className="desktop-nav">
          <a href="#hero" className="nav-link">Home</a>
          <a href="#usp" className="nav-link">USP</a>
          <a href="#roles" className="nav-link">Roles</a>
          <a href="#connect" className="nav-link">Connect</a>
        </nav>

        <div
  className="home-notification-wrapper"
  ref={notificationRef}
>
  <button
    type="button"
    className="home-notification-button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowNotifications((prev) => !prev);
    }}
    aria-label="View alerts"
  >
    <FaBell />

    {notifications.length > 0 && (
      <span className="home-notification-count">
        {notifications.length}
      </span>
    )}
  </button>

  {showNotifications && (
    <div className="home-notification-panel">

      <div className="home-notification-header">
        <div>
          <strong>Alerts</strong>
          <span>Important system notifications</span>
        </div>

        <span className="home-notification-total">
          {notifications.length}
        </span>
      </div>

      <div className="home-notification-list">

        {notifications.length > 0 ? (

          notifications.map((alert) => {

            const severity = String(
              alert.Severity || "MEDIUM"
            ).toUpperCase();

            return (
              <button
                type="button"
                className="home-notification-item"
                key={alert.Alert_ID}
                onClick={openAlertPage}
              >

                <span
                  className={`home-notification-dot ${
                    severity === "HIGH"
                      ? "high"
                      : "medium"
                  }`}
                />

                <div className="home-notification-content">

                  <strong>
                    {alert.Alert_Type
                      ?.replaceAll("_", " ")
                      || "System Alert"}
                  </strong>

                  <p>
                    {alert.Alert_Message}
                  </p>

                  <small>
                    {alert.Alert_Date
                      ? new Date(
                          alert.Alert_Date
                        ).toLocaleString()
                      : "Recent"}
                  </small>

                </div>

              </button>
            );
          })

        ) : (

          <div className="home-notification-empty">
            <FaBell />
            <p>No important alerts</p>
          </div>

        )}

      </div>

      {notifications.length > 0 && (
        <button
          type="button"
          className="home-view-alerts"
          onClick={openAlertPage}
        >
          View all alerts →
        </button>
      )}

    </div>
  )}

</div>

        <div className="desktop-auth-buttons">
          {user ? (
            <>
              <Link to={getDashboardPath()} className="btn btn-secondary auth-dashboard-btn">
                <FaUser /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-danger auth-logout-btn">
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary login-nav-btn">Login</Link>
              <Link to="/signup" className="btn btn-primary signup-nav-btn">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Icon */}
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Mobile Drawer */}
        <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-nav">
            <a href="#hero" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#usp" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>USP</a>
            <a href="#roles" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Roles</a>
            <a href="#connect" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Connect</a>
            
            <div className="mobile-auth-section">
              {user ? (
                <>
                  <Link to={getDashboardPath()} className="btn btn-secondary mobile-auth-btn" onClick={() => setMobileMenuOpen(false)}>
                    <FaUser /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn btn-danger mobile-auth-btn">
                    <FaSignOutAlt /> Logout
                  </button>
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
