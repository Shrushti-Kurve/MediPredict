import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { getAlerts, getMedicines, checkMedicineStockAlerts } from '../../services/localStorageService';
import { 
  FaBell, 
  FaSearch, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaPills, 
  FaSyncAlt,
  FaHeartbeat,
  FaTimesCircle
} from 'react-icons/fa';
import './AdminAlerts.css';

const AdminAlerts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAlerts = () => {
    const raw = getAlerts() || [];
    setAlerts(raw);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleRefreshAlerts = () => {
    setIsRefreshing(true);
    const medicines = getMedicines();
    checkMedicineStockAlerts(medicines);
    setTimeout(() => {
      loadAlerts();
      setIsRefreshing(false);
    }, 500);
  };

  const getAlertSeverity = (alert) => {
    const raw = (alert.type || alert.Severity || alert.severity || '').toString().toUpperCase();
    if (/CRITICAL|HIGH|DANGER/.test(raw)) return 'Critical';
    if (/WARNING|MEDIUM|ATTENTION/.test(raw)) return 'Warning';
    if (/MEDICINE/.test(raw)) return 'Medicine';
    return 'Info';
  };

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

  const filteredAlerts = alerts.filter((alert) => {
    const severity = getAlertSeverity(alert);
    const msg = (alert.message || alert.Alert_Message || alert.title || alert.description || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch = !query || msg.includes(query);
    const matchesSeverity = selectedSeverity === 'all' || severity.toLowerCase() === selectedSeverity.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  const medicineAlerts = filteredAlerts.filter(isMedicineAlert);
  const diseaseAlerts = filteredAlerts.filter(a => !isMedicineAlert(a));

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'Critical':
        return <FaTimesCircle className="alert-icon critical-icon" />;
      case 'Warning':
        return <FaExclamationTriangle className="alert-icon warning-icon" />;
      case 'Medicine':
        return <FaPills className="alert-icon medicine-icon" />;
      default:
        return <FaInfoCircle className="alert-icon info-icon" />;
    }
  };

  const getAlertBadgeClass = (severity) => {
    switch (severity) {
      case 'Critical': return 'badge badge-danger';
      case 'Warning': return 'badge badge-warning';
      case 'Medicine': return 'badge badge-info';
      default: return 'badge badge-primary';
    }
  };

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => getAlertSeverity(a) === 'Critical').length,
    warning: alerts.filter(a => getAlertSeverity(a) === 'Warning').length,
    medicine: alerts.filter(isMedicineAlert).length,
    disease: alerts.filter(a => !isMedicineAlert(a)).length
  };

  const renderAlertCard = (alert) => {
    const severity = getAlertSeverity(alert);
    const isMed = isMedicineAlert(alert);
    return (
      <div 
        key={alert.id} 
        className={`admin-alert-card border-${severity.toLowerCase()}`}
      >
        <div className="admin-alert-card-main">
          <div className="admin-alert-icon-col">
            {getAlertIcon(severity)}
          </div>
          <div className="admin-alert-text-col">
            <div className="admin-alert-topline">
              <span className={getAlertBadgeClass(severity)}>
                {severity}
              </span>
              <span className="admin-alert-category-tag">
                {isMed ? 'Medicine Inventory' : 'Disease & Clinical'}
              </span>
              <span className="admin-alert-time">
                {alert.date || alert.Alert_Date || 'Recent'}
              </span>
            </div>
            <h4 style={{ margin: '0.25rem 0 0.15rem', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              {alert.title || alert.message}
            </h4>
            <p className="admin-alert-body">
              {alert.description || alert.message || alert.Alert_Message}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      <div className="dashboard-main">
        <DashboardHeader title="System & Clinical Alerts Center" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          {/* Header Bar */}
          <div className="admin-page-header">
            <div>
              <h2 className="admin-page-title">Master System Alerts & Notifications</h2>
              <p className="admin-page-subtitle">
                Real-time monitoring of pharmaceutical stockouts, clinical disease trends, and facility updates.
              </p>
            </div>
            <button 
              type="button" 
              className={`btn btn-secondary ${isRefreshing ? 'pbi-spinning' : ''}`}
              onClick={handleRefreshAlerts}
            >
              <FaSyncAlt /> Refresh Alerts
            </button>
          </div>

          {/* Filter and Search Bar */}
          <div className="admin-alerts-controls">
            <div className="search-bar-wrapper admin-search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search alerts by medicine, disease, or symptoms..."
                className="form-control search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Severity Filter Tabs */}
            <div className="admin-filter-tabs">
              <button 
                className={`admin-filter-tab ${selectedSeverity === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedSeverity('all')}
              >
                All Severities
              </button>
              <button 
                className={`admin-filter-tab ${selectedSeverity === 'critical' ? 'active' : ''}`}
                onClick={() => setSelectedSeverity('critical')}
              >
                Critical ({stats.critical})
              </button>
              <button 
                className={`admin-filter-tab ${selectedSeverity === 'warning' ? 'active' : ''}`}
                onClick={() => setSelectedSeverity('warning')}
              >
                Warning ({stats.warning})
              </button>
            </div>
          </div>

          {/* TWO SEPARATE BOXES (Requirement 6) */}
          <div className="alerts-two-box-layout">
            {/* BOX 1: MEDICINE ALERTS */}
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
                Medicine out of stock, low inventory thresholds, expiry notices, and pharmacy inventory alerts.
              </p>

              {medicineAlerts.length > 0 ? (
                <div className="admin-alerts-list">
                  {medicineAlerts.map(renderAlertCard)}
                </div>
              ) : (
                <div className="alerts-empty-state-mini">
                  <p>No active medicine alerts found.</p>
                </div>
              )}
            </div>

            {/* BOX 2: DISEASE ALERTS */}
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
                Disease trends, outbreaks, high case clusters, patient emergency conditions, and clinical notices.
              </p>

              {diseaseAlerts.length > 0 ? (
                <div className="admin-alerts-list">
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

export default AdminAlerts;
