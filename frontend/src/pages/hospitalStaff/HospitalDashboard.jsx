import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import PowerBIEmbed from '../../components/PowerBIEmbed/PowerBIEmbed';
import { getPatients, getAlerts } from '../../services/localStorageService';
import { 
  FaUserInjured, 
  FaUserPlus, 
  FaHeartbeat, 
  FaCalendarDay,
  FaChartPie,
  FaListAlt
} from 'react-icons/fa';
import './HospitalDashboard.css';

const HospitalDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState('overview'); // 'overview' | 'powerbi'
  const [stats, setStats] = useState({
    totalPatients: 0,
    newPatients: 0,
    activePatients: 0,
    todaysVisits: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    const patients = getPatients();
    const alerts = getAlerts();
    
    const todayStr = '2026-08-14';
    
    // Calculate statistics
    const total = patients.length;
    const news = patients.filter(p => p.lastVisit === todayStr || p.lastVisit === '2026-08-13').length;
    const active = patients.filter(p => p.status === 'Active' || p.status === 'Critical' || p.status === 'Under Observation').length;
    const todays = patients.filter(p => p.lastVisit === todayStr).length;

    setStats({
      totalPatients: total,
      newPatients: news,
      activePatients: active,
      todaysVisits: todays
    });

    setRecentPatients(patients.slice(0, 5));
    // Filter alerts for staff role
    setRecentAlerts(alerts.filter(a => a.role === 'hospitalStaff').slice(0, 5));
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Critical': return 'badge badge-danger';
      case 'Active': return 'badge badge-warning';
      case 'Under Observation': return 'badge badge-info';
      case 'Recovered': return 'badge badge-success';
      default: return 'badge badge-primary';
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
        <DashboardHeader title="Hospital Operations & Patient Inflow" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          {/* Main Dashboard Navigation Tabs */}
          <div className="dashboard-view-tabs">
            <button 
              className={`view-tab-btn ${activeViewTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveViewTab('overview')}
            >
              <FaListAlt /> Operations Overview
            </button>
            <button 
              className={`view-tab-btn ${activeViewTab === 'powerbi' ? 'active' : ''}`}
              onClick={() => setActiveViewTab('powerbi')}
            >
              <FaChartPie /> Power BI Operations Analytics
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-primary">
                <FaUserInjured />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Registered</span>
                <span className="stat-number">{stats.totalPatients}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-secondary">
                <FaUserPlus />
              </div>
              <div className="stat-info">
                <span className="stat-label">New Admissions</span>
                <span className="stat-number">{stats.newPatients}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-success">
                <FaHeartbeat />
              </div>
              <div className="stat-info">
                <span className="stat-label">Active In-Care</span>
                <span className="stat-number">{stats.activePatients}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-warning">
                <FaCalendarDay />
              </div>
              <div className="stat-info">
                <span className="stat-label">Today's Footfall</span>
                <span className="stat-number">{stats.todaysVisits}</span>
              </div>
            </div>
          </div>

          {/* Power BI Embed Container (Shown in Dedicated Tab or Prominently Embedded) */}
          {activeViewTab === 'powerbi' ? (
            <div className="powerbi-section-wrapper">
              <PowerBIEmbed role="hospitalStaff" height="640px" />
            </div>
          ) : (
            <>
              {/* Power BI Quick Glance Widget */}
              <div className="dashboard-powerbi-banner">
                <div className="pbi-banner-content">
                  <div className="pbi-banner-badge">
                    <FaChartPie /> Live Power BI Telemetry
                  </div>
                  <h3>Hospital Bed Occupancy & Rural Triage Report</h3>
                  <p>Real-time analytics on patient admissions velocity, ward utilization, and clinic wait-time metrics.</p>
                </div>
                <button 
                  className="btn btn-outline-light pbi-banner-btn"
                  onClick={() => setActiveViewTab('powerbi')}
                >
                  Open Full Power BI Dashboard
                </button>
              </div>

              <div className="dashboard-details-grid">
                {/* Recent Admissions Section */}
                <div className="dashboard-card-section recent-patients-section">
                  <div className="db-card-header">
                    <h2>Patient Admissions Snapshot</h2>
                    <Link to="/hospital/patients" className="db-card-header-link">Manage Patients</Link>
                  </div>
                  
                  <div className="table-responsive">
                    {recentPatients.length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Age / Gender</th>
                            <th>Admitting Diagnosis</th>
                            <th>Status</th>
                            <th>Last Visit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentPatients.map(patient => (
                            <tr key={patient.id}>
                              <td className="font-weight-600">{patient.id}</td>
                              <td className="font-weight-600">{patient.name}</td>
                              <td>{patient.age} / {patient.gender}</td>
                              <td>{patient.disease || 'General Checkup'}</td>
                              <td>
                                <span className={getStatusBadgeClass(patient.status)}>
                                  {patient.status}
                                </span>
                              </td>
                              <td>{patient.lastVisit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="empty-state-container">
                        <p>No patients registered.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Staff Alerts */}
                <div className="dashboard-card-section recent-alerts-section">
                  <div className="db-card-header">
                    <h2>Operations & Facility Alerts</h2>
                    <Link to="/hospital/alerts" className="db-card-header-link">View All</Link>
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
                        <p>No new alerts.</p>
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

export default HospitalDashboard;

