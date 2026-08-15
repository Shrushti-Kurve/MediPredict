import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { FaSearch, FaBell, FaExclamationTriangle, FaInfoCircle, FaPlusCircle } from 'react-icons/fa';
import './DoctorAlerts.css';
import { getAlerts } from "../../services/api/alertService";

const DoctorAlerts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await getAlerts();
      setAlerts(data.filter(a => a.role === 'doctor'));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredAlerts = alerts.filter(alert =>
    alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAlertIcon = (type) => {
    switch (type) {
      case 'Critical': return <FaPlusCircle className="alert-icon critical" />;
      case 'Warning': return <FaExclamationTriangle className="alert-icon warning" />;
      case 'Medicine': return <FaInfoCircle className="alert-icon medicine" />;
      default: return <FaBell className="alert-icon info" />;
    }
  };

  const getAlertBadgeClass = (type) => {
    switch (type) {
      case 'Critical': return 'badge badge-danger';
      case 'Warning': return 'badge badge-warning';
      case 'Medicine': return 'badge badge-info';
      default: return 'badge badge-primary';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      <div className="dashboard-main">
        <DashboardHeader title="System & Patient Alerts" toggleSidebar={setSidebarOpen} />
        
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
                  <div key={alert.id} className={`alert-detail-card alert-border-${alert.type.toLowerCase()}`}>
                    <div className="alert-card-left">
                      {getAlertIcon(alert.type)}
                      <div className="alert-card-content">
                        <p className="alert-card-msg">{alert.message}</p>
                        <span className="alert-card-timestamp">{alert.date}</span>
                      </div>
                    </div>
                    <div className="alert-card-right">
                      <span className={getAlertBadgeClass(alert.type)}>
                        {alert.type}
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

export default DoctorAlerts;
