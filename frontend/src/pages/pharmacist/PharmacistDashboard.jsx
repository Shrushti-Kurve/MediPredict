import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import PowerBIEmbed from '../../components/PowerBIEmbed/PowerBIEmbed';
import { getMedicines, getAlerts } from '../../services/localStorageService';
import { 
  FaPills, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimesCircle, 
  FaChartPie, 
  FaListAlt 
} from 'react-icons/fa';
import './PharmacistDashboard.css';

const PharmacistDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState('overview'); // 'overview' | 'powerbi'
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    lowStock: 0,
    outOfStock: 0
  });
  const [recentMeds, setRecentMeds] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    const medicines = getMedicines();
    const alerts = getAlerts();

    // Calculate stats
    const total = medicines.length;
    const available = medicines.filter(m => m.quantity > m.minimumStock).length;
    const low = medicines.filter(m => m.quantity <= m.minimumStock && m.quantity > 0).length;
    const out = medicines.filter(m => m.quantity === 0).length;

    setStats({
      total,
      available,
      lowStock: low,
      outOfStock: out
    });

    setRecentMeds(medicines.slice(0, 5));
    // Filter alerts for pharmacist role
    setRecentAlerts(alerts.filter(a => a.role === 'pharmacist').slice(0, 5));
  }, []);

  const getStatusBadge = (med) => {
    const qty = parseInt(med.quantity);
    const min = parseInt(med.minimumStock);
    if (qty === 0) {
      return <span className="badge badge-danger">Out of Stock</span>;
    }
    if (qty <= min) {
      return <span className="badge badge-warning">Low Stock</span>;
    }
    return <span className="badge badge-success">Available</span>;
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
        <DashboardHeader title="Pharmacy Inventory & Logistics" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          {/* Main Dashboard Navigation Tabs */}
          <div className="dashboard-view-tabs">
            <button 
              className={`view-tab-btn ${activeViewTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveViewTab('overview')}
            >
              <FaListAlt /> Stock Overview
            </button>
            <button 
              className={`view-tab-btn ${activeViewTab === 'powerbi' ? 'active' : ''}`}
              onClick={() => setActiveViewTab('powerbi')}
            >
              <FaChartPie /> Power BI Supply Chain Analytics
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-primary">
                <FaPills />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Inventory</span>
                <span className="stat-number">{stats.total}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-success">
                <FaCheckCircle />
              </div>
              <div className="stat-info">
                <span className="stat-label">Available Stocks</span>
                <span className="stat-number">{stats.available}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-warning">
                <FaExclamationTriangle />
              </div>
              <div className="stat-info">
                <span className="stat-label">Low Stock Items</span>
                <span className="stat-number">{stats.lowStock}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-danger">
                <FaTimesCircle />
              </div>
              <div className="stat-info">
                <span className="stat-label">Out of Stock</span>
                <span className="stat-number">{stats.outOfStock}</span>
              </div>
            </div>
          </div>

          {/* Power BI Embed Container */}
          {activeViewTab === 'powerbi' ? (
            <div className="powerbi-section-wrapper">
              <PowerBIEmbed role="pharmacist" height="640px" />
            </div>
          ) : (
            <>
              {/* Power BI Quick Glance Banner */}
              <div className="dashboard-powerbi-banner">
                <div className="pbi-banner-content">
                  <div className="pbi-banner-badge">
                    <FaChartPie /> Live Supply Chain Power BI Intelligence
                  </div>
                  <h3>Pharmaceutical Velocity & Run-out Forecast</h3>
                  <p>Real-time predictive modeling on inventory velocity, batch expiry horizons, and automated procurement reorders.</p>
                </div>
                <button 
                  className="btn btn-outline-light pbi-banner-btn"
                  onClick={() => setActiveViewTab('powerbi')}
                >
                  View Full Power BI Analytics
                </button>
              </div>

              <div className="dashboard-details-grid">
                {/* Medicine Directory Snapshot */}
                <div className="dashboard-card-section recent-patients-section">
                  <div className="db-card-header">
                    <h2>Medicine Stock Snapshot</h2>
                    <Link to="/pharmacist/medicines" className="db-card-header-link">Manage Inventory</Link>
                  </div>
                  
                  <div className="table-responsive">
                    {recentMeds.length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Qty</th>
                            <th>Min Level</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentMeds.map(med => (
                            <tr key={med.id}>
                              <td className="font-weight-600">{med.id}</td>
                              <td className="font-weight-600">{med.name}</td>
                              <td>{med.category}</td>
                              <td>{med.quantity}</td>
                              <td>{med.minimumStock}</td>
                              <td>{getStatusBadge(med)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="empty-state-container">
                        <p>No medicines logged.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Pharmacy Alerts */}
                <div className="dashboard-card-section recent-alerts-section">
                  <div className="db-card-header">
                    <h2>Inventory Alerts</h2>
                    <Link to="/pharmacist/alerts" className="db-card-header-link">View All</Link>
                  </div>

                  <div className="alerts-summary-list">
                    {recentAlerts.length > 0 ? (
                      recentAlerts.map(alert => (
                        <div key={alert.id} className="summary-alert-item">
                          <div className="alert-item-header">
                            <span className={getAlertBadgeClass(alert.type)}>
                              {alert.type}
                            </span>
                            <span className="alert-item-time">{alert.date}</span>
                          </div>
                          <p className="alert-item-message">{alert.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state-container">
                        <p>No stock alerts.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default PharmacistDashboard;

