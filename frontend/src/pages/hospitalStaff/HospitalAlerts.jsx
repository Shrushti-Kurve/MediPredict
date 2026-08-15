import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { FaSearch, FaBell, FaExclamationTriangle, FaInfoCircle, FaPlusCircle } from 'react-icons/fa';
import './HospitalAlerts.css';
import { getRoleAlerts } from "../../services/api/alertService";

const HospitalAlerts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await getRoleAlerts('hospitalStaff');
        setAlerts(data);
      } catch (error) {
        console.error('Failed to load hospital alerts:', error);
      }
    };

    loadAlerts();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredAlerts = alerts.filter(alert =>
    `${alert.title} ${alert.description} ${alert.severity}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'Critical': return <FaPlusCircle className="alert-icon critical" />;
      case 'Warning': return <FaExclamationTriangle className="alert-icon warning" />;
      case 'Info': return <FaInfoCircle className="alert-icon medicine" />;
      default: return <FaBell className="alert-icon info" />;
    }
  };

  const getAlertBadgeClass = (severity) => {
    switch (severity) {
      case 'Critical': return 'badge badge-danger';
      case 'Warning': return 'badge badge-warning';
      case 'Info': return 'badge badge-success';
      default: return 'badge badge-primary';
    }
  };

  const formatAlertDate = (date) => {
    if (!date) return 'Recent alert';
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return date;
    return value.toLocaleString();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      <div className="dashboard-main">
        <DashboardHeader title="System & Admissions Alerts" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          <div className="alerts-page-controls">
            <div className="search-bar-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search alerts by message or level..."
                className="form-control search-input"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="alerts-full-container">
            {filteredAlerts.length > 0 ? (
              <div className="alerts-detailed-list">
                {filteredAlerts.map(alert => (
                  <div key={alert.id} className={`alert-detail-card alert-border-${alert.severity.toLowerCase()}`}>
                    <div className="alert-card-left">
                      {getAlertIcon(alert.severity)}
                      <div className="alert-card-content">
                        <h3 className="alert-card-title">{alert.title}</h3>
                        <p className="alert-card-msg">{alert.description}</p>
                        <span className="alert-card-timestamp">{formatAlertDate(alert.date)}</span>
                      </div>
                    </div>
                    <div className="alert-card-right">
                      <span className={getAlertBadgeClass(alert.severity)}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alerts-empty-state">
                <FaBell className="empty-bell" />
                <h3>No new alerts.</h3>
                <p>Everything is currently running smoothly.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HospitalAlerts;
