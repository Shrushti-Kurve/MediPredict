import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { 
  FaSearch, 
  FaBell, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaPlusCircle,
  FaPills,
  FaHeartbeat
} from 'react-icons/fa';
import './HospitalAlerts.css';
import { getAlerts } from '../../services/localStorageService';

const HospitalAlerts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const raw = getAlerts() || [];
    setAlerts(raw);
  }, []);

  const isMedicineAlert = (alert) => {
    const text = `${alert.title || ''} ${alert.description || ''} ${alert.message || ''} ${alert.category || ''}`.toLowerCase();
    return (
      alert.category === 'medicine' ||
      text.includes('medicine') ||
      text.includes('stock') ||
      text.includes('inventory') ||
      text.includes('expiry') ||
      text.includes('expired') ||
      text.includes('paracetamol') ||
      text.includes('amoxicillin') ||
      text.includes('salbutamol') ||
      text.includes('chloroquine') ||
      text.includes('atorvastatin') ||
      text.includes('rifampicin') ||
      text.includes('metformin') ||
      text.includes('dispensed')
    );
  };

  const filteredAlerts = alerts.filter(alert =>
    `${alert.title || ''} ${alert.description || ''} ${alert.message || ''} ${alert.severity || ''} ${alert.type || ''}`.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const medicineAlerts = filteredAlerts.filter(isMedicineAlert);
  const diseaseAlerts = filteredAlerts.filter(a => !isMedicineAlert(a));

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

  const renderAlertCard = (alert) => {
    const sev = alert.severity || alert.type || 'Info';
    return (
      <div key={alert.id} className={`alert-detail-card alert-border-${sev.toLowerCase()}`}>
        <div className="alert-card-left">
          {getAlertIcon(sev)}
          <div className="alert-card-content">
            <h3 className="alert-card-title">{alert.title || alert.message}</h3>
            <p className="alert-card-msg">{alert.description || alert.message}</p>
            <span className="alert-card-timestamp">{formatAlertDate(alert.date)}</span>
          </div>
        </div>
        <div className="alert-card-right">
          <span className={getAlertBadgeClass(sev)}>
            {sev}
          </span>
        </div>
      </div>
    );
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
                placeholder="Search alerts by disease, patient, or medicine..."
                className="form-control search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="alerts-two-box-layout">
            {/* BOX 1: MEDICINE ALERTS (Requirement 6) */}
            <div className="alert-category-box">
              <div className="alert-category-box-header">
                <div className="alert-category-title">
                  <FaPills style={{ color: '#0f766e', fontSize: '1.35rem' }} />
                  <span>Medicine Alerts</span>
                </div>
                <span className="alert-category-badge" style={{ backgroundColor: '#ccfbf1', color: '#0f766e' }}>
                  {medicineAlerts.length} Active Alert{medicineAlerts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                Inventory shortages, low stock thresholds, and medicine expiry notices.
              </p>

              {medicineAlerts.length > 0 ? (
                <div className="alerts-detailed-list">
                  {medicineAlerts.map(renderAlertCard)}
                </div>
              ) : (
                <div className="alerts-empty-state-mini">
                  <p>No active medicine alerts found.</p>
                </div>
              )}
            </div>

            {/* BOX 2: DISEASE ALERTS (Requirement 6) */}
            <div className="alert-category-box">
              <div className="alert-category-box-header">
                <div className="alert-category-title">
                  <FaHeartbeat style={{ color: '#dc2626', fontSize: '1.35rem' }} />
                  <span>Disease Alerts</span>
                </div>
                <span className="alert-category-badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                  {diseaseAlerts.length} Active Alert{diseaseAlerts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                Disease outbreaks, surge in symptoms, admission flags, and clinical tracking.
              </p>

              {diseaseAlerts.length > 0 ? (
                <div className="alerts-detailed-list">
                  {diseaseAlerts.map(renderAlertCard)}
                </div>
              ) : (
                <div className="alerts-empty-state-mini">
                  <p>No active disease alerts found.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HospitalAlerts;
