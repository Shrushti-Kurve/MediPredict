import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import PowerBIEmbed from '../../components/PowerBIEmbed/PowerBIEmbed';
import { getPatients, getAlerts } from '../../services/localStorageService';
import { 
  FaUserInjured, 
  FaCalendarDay, 
  FaUserCheck, 
  FaBell, 
  FaChartPie, 
  FaListAlt,
  FaPills
} from 'react-icons/fa';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState('overview'); // 'overview' | 'powerbi'
  const [stats, setStats] = useState({
    totalPatients: 0,
    todaysPatients: 0,
    activeTreatments: 0,
    alertsCount: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    const patients = getPatients();
    const alerts = getAlerts();
    
    const todayStr = '2026-08-14';
    const todays = patients.filter(p => p.lastVisit === todayStr).length;
    const active = patients.filter(p => p.status === 'Active' || p.status === 'Under Observation' || p.status === 'Critical').length;
    const docAlerts = alerts.filter(a => a.role === 'doctor');

    setStats({
      totalPatients: patients.length,
      todaysPatients: todays,
      activeTreatments: active,
      alertsCount: docAlerts.length
    });

    setRecentPatients(patients.slice(0, 5));
    setRecentAlerts(docAlerts.slice(0, 5));
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
        <DashboardHeader title="Doctor Clinical Workspace" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          {/* Main Dashboard Navigation Tabs */}
          <div className="dashboard-view-tabs">
            <button 
              className={`view-tab-btn ${activeViewTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveViewTab('overview')}
            >
              <FaListAlt /> Clinical Overview
            </button>
            <button 
              className={`view-tab-btn ${activeViewTab === 'powerbi' ? 'active' : ''}`}
              onClick={() => setActiveViewTab('powerbi')}
            >
              <FaChartPie /> Power BI Clinical Analytics
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-primary">
                <FaUserInjured />
              </div>
              <div className="stat-info">
                <span className="stat-label">Consulted Patients</span>
                <span className="stat-number">{stats.totalPatients}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-secondary">
                <FaCalendarDay />
              </div>
              <div className="stat-info">
                <span className="stat-label">Today's Visits</span>
                <span className="stat-number">{stats.todaysPatients}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-success">
                <FaUserCheck />
              </div>
              <div className="stat-info">
                <span className="stat-label">Active Treatments</span>
                <span className="stat-number">{stats.activeTreatments}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-danger">
                <FaBell />
              </div>
              <div className="stat-info">
                <span className="stat-label">Clinical Alerts</span>
                <span className="stat-number">{stats.alertsCount}</span>
              </div>
            </div>
          </div>

          {/* Power BI Embed Container */}
          {activeViewTab === 'powerbi' ? (
            <div className="powerbi-section-wrapper">
              <PowerBIEmbed role="doctor" height="640px" />
            </div>
          ) : (
            <>
              {/* Power BI Quick Glance Banner */}
              <div className="dashboard-powerbi-banner">
                <div className="pbi-banner-content">
                  <div className="pbi-banner-badge">
                    <FaChartPie /> Live Clinical Power BI Intelligence
                  </div>
                  <h3>Clinical Treatment Outcomes & Prevalence Telemetry</h3>
                  <p>Comprehensive ML-backed analytics on disease clusters, antibiotic efficacy, and patient follow-up adherence.</p>
                </div>
                <button 
                  className="btn btn-outline-light pbi-banner-btn"
                  onClick={() => setActiveViewTab('powerbi')}
                >
                  Launch Full Power BI Dashboard
                </button>
              </div>

              <div className="dashboard-details-grid">
                {/* Recent Patients Table */}
                <div className="dashboard-card-section recent-patients-section">
                  <div className="db-card-header">
                    <h2>Recent Patients & Prescriptions</h2>
                    <Link to="/doctor/patients" className="db-card-header-link">Manage Prescriptions</Link>
                  </div>
                  
                  <div className="table-responsive">
                    {recentPatients.length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Patient ID</th>
                            <th>Name</th>
                            <th>Diagnosis</th>
                            <th>Prescribed Meds</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentPatients.map(patient => {
                            const meds = patient.medicines || [];
                            return (
                              <tr key={patient.id}>
                                <td className="font-weight-600">{patient.id}</td>
                                <td className="font-weight-600">{patient.name}</td>
                                <td>{patient.disease || 'Unspecified'}</td>
                                <td>
                                  {meds.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', background: '#ccfbf1', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                                        <FaPills /> {meds.length} Med{meds.length > 1 ? 's' : ''}
                                      </span>
                                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        {meds.map(m => m.name).slice(0, 2).join(', ')}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted font-size-sm">None</span>
                                  )}
                                </td>
                                <td>
                                  <span className={getStatusBadgeClass(patient.status)}>
                                    {patient.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="empty-state-container">
                        <p>No patients found.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Alerts Column */}
                <div className="dashboard-card-section recent-alerts-section">
                  <div className="db-card-header">
                    <h2>Clinical & Risk Alerts</h2>
                    <Link to="/doctor/alerts" className="db-card-header-link">View All</Link>
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
                        <p>No new clinical alerts.</p>
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

export default DoctorDashboard;

