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
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  const getAlertCategory = (alert) => {
    const msg = (alert.message || alert.Alert_Message || alert.description || '').toLowerCase();
    const cat = (alert.Alert_Category || alert.category || alert.role || '').toLowerCase();
    if (cat.includes('medicine') || msg.includes('stock') || msg.includes('medicine') || msg.includes('paracetamol') || msg.includes('amoxicillin')) {
      return 'medicine';
    }
    if (cat.includes('doctor') || cat.includes('patient') || msg.includes('patient') || msg.includes('asthma') || msg.includes('hypertension')) {
      return 'patient';
    }
    return 'system';
  };

  const filteredAlerts = alerts.filter((alert) => {
    const severity = getAlertSeverity(alert);
    const category = getAlertCategory(alert);
    const msg = (alert.message || alert.Alert_Message || alert.title || alert.description || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch = !query || msg.includes(query);
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || severity.toLowerCase() === selectedSeverity.toLowerCase();

    return matchesSearch && matchesCategory && matchesSeverity;
  });

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
    medicine: alerts.filter(a => getAlertCategory(a) === 'medicine').length,
    patient: alerts.filter(a => getAlertCategory(a) === 'patient').length
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
                Real-time monitoring of pharmaceutical stockouts, clinical emergency flags, and hospital facility updates.
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

          {/* Alert Metric Cards */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-primary">
                <FaBell />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total System Alerts</span>
                <span className="stat-number">{stats.total}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-danger">
                <FaTimesCircle />
              </div>
              <div className="stat-info">
                <span className="stat-label">Critical Conditions</span>
                <span className="stat-number">{stats.critical}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-warning">
                <FaPills />
              </div>
              <div className="stat-info">
                <span className="stat-label">Medicine Stock Alerts</span>
                <span className="stat-number">{stats.medicine}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-success">
                <FaHeartbeat />
              </div>
              <div className="stat-info">
                <span className="stat-label">Patient Clinical Flags</span>
                <span className="stat-number">{stats.patient}</span>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="admin-alerts-controls">
            <div className="search-bar-wrapper admin-search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search alerts by medicine, disease or message..."
                className="form-control search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="admin-alerts-filters">
              {/* Category Filter */}
              <div className="admin-filter-tabs">
                <button 
                  className={`admin-filter-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All Categories ({stats.total})
                </button>
                <button 
                  className={`admin-filter-tab ${selectedCategory === 'medicine' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('medicine')}
                >
                  Medicine Stock ({stats.medicine})
                </button>
                <button 
                  className={`admin-filter-tab ${selectedCategory === 'patient' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('patient')}
                >
                  Patient Care ({stats.patient})
                </button>
                <button 
                  className={`admin-filter-tab ${selectedCategory === 'system' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('system')}
                >
                  System Info
                </button>
              </div>

              {/* Severity Filter */}
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
          </div>

          {/* Alerts List Container */}
          <div className="admin-alerts-container">
            {filteredAlerts.length > 0 ? (
              <div className="admin-alerts-list">
                {filteredAlerts.map((alert) => {
                  const severity = getAlertSeverity(alert);
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
                              {getAlertCategory(alert) === 'medicine' ? 'Medicine Inventory' : getAlertCategory(alert) === 'patient' ? 'Clinical Patient' : 'Facility System'}
                            </span>
                            <span className="admin-alert-time">
                              {alert.date || alert.Alert_Date || 'Recent'}
                            </span>
                          </div>
                          <p className="admin-alert-body">
                            {alert.message || alert.Alert_Message || alert.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state-container" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                <FaBell style={{ fontSize: '3rem', color: '#94a3b8', marginBottom: '1rem' }} />
                <h3>No alerts match your filter criteria</h3>
                <p style={{ color: '#64748b' }}>All monitored medical telemetry parameters are within normal thresholds.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAlerts;
