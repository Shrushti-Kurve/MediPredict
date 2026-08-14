import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { getLoggedInUser, logout } from '../../services/localStorageService';
import logo from '../../assets/logo/logo.png';
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
