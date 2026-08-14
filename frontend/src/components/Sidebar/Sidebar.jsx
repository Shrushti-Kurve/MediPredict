import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  FaUser, 
  FaSignOutAlt, 
  FaChartBar, 
  FaUserInjured, 
  FaBell, 
  FaPills, 
  FaTimes 
} from 'react-icons/fa';
import { getLoggedInUser, logout } from '../../services/localStorageService';
import logo from '../../assets/logo/logo.png';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const user = getLoggedInUser();

  const handleLogout = () => {
    logout();
    if (toggleSidebar) toggleSidebar();
    navigate('/login');
  };

  if (!user) return null;

  const renderLinks = () => {
    switch (user.role) {
      case 'doctor':
        return (
          <>
            <NavLink 
              to="/doctor/dashboard" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => toggleSidebar && toggleSidebar(false)}
            >
              <FaChartBar className="sidebar-icon" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/doctor/patients" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => toggleSidebar && toggleSidebar(false)}
            >
              <FaUserInjured className="sidebar-icon" />
              <span>Patient List</span>
            </NavLink>
            <NavLink 
              to="/doctor/alerts" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => toggleSidebar && toggleSidebar(false)}
            >
              <FaBell className="sidebar-icon" />
              <span>Alerts</span>
            </NavLink>
            <NavLink 
              to="/doctor/profile" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => toggleSidebar && toggleSidebar(false)}
            >
              <FaUser className="sidebar-icon" />
              <span>Profile</span>
            </NavLink>
          </>
        );
      case 'hospitalStaff':
        return (
          <>
            <NavLink 
              to="/hospital/dashboard" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => toggleSidebar && toggleSidebar(false)}
            >
              <FaChartBar className="sidebar-icon" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/hospital/patients" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => toggleSidebar && toggleSidebar(false)}
            >
              <FaUserInjured className="sidebar-icon" />
              <span>Patient Management</span>
            </NavLink>
            <NavLink 
              to="/hospital/alerts" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => toggleSidebar && toggleSidebar(false)}
            >
              <FaBell className="sidebar-icon" />
              <span>Alerts</span>
            </NavLink>
            <NavLink 
              to="/hospital/profile" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => toggleSidebar && toggleSidebar(false)}
            >
              <FaUser className="sidebar-icon" />
              <span>Profile</span>
            </NavLink>
          </>
        );
      case 'pharmacist':
        return (
          <>
            <NavLink 
              to="/pharmacist/dashboard" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => toggleSidebar && toggleSidebar(false)}
            >
              <FaChartBar className="sidebar-icon" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink 
              to="/pharmacist/medicines" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => toggleSidebar && toggleSidebar(false)}
            >
              <FaPills className="sidebar-icon" />
              <span>Medicine Stock</span>
            </NavLink>
            <NavLink 
              to="/pharmacist/alerts" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => toggleSidebar && toggleSidebar(false)}
            >
              <FaBell className="sidebar-icon" />
              <span>Alerts</span>
            </NavLink>
            <NavLink 
              to="/pharmacist/profile" 
              className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
              onClick={() => toggleSidebar && toggleSidebar(false)}
            >
              <FaUser className="sidebar-icon" />
              <span>Profile</span>
            </NavLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo-container">
          <img src={logo} alt="MediPredict Logo" className="sidebar-logo" />
          <div>
            <h3 className="sidebar-title">MediPredict</h3>
            <p className="sidebar-subtitle">Rural Healthcare</p>
          </div>
        </Link>
        {toggleSidebar && (
          <button className="sidebar-close-btn" onClick={() => toggleSidebar(false)} aria-label="Close Sidebar">
            <FaTimes />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {renderLinks()}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="sidebar-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
