import React from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { getLoggedInUser } from '../../services/localStorageService';
import logo from '../../assets/logo/logo.png';
import './DashboardHeader.css';

const DashboardHeader = ({ title, toggleSidebar }) => {
  const user = getLoggedInUser();
  const displayName = user?.name?.trim() || 'Doctor';

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
          <span className="db-header-welcome">Welcome, {displayName}</span>
          {title ? <h1 className="db-header-title">{title}</h1> : null}
        </div>
      </div>
      
      <div className="db-header-right">
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
