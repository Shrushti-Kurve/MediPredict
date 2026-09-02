import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { getPatients } from '../../services/localStorageService';
import { 
  FaUserInjured, 
  FaSearch, 
  FaHeartbeat, 
  FaMapMarkerAlt,
  FaPills
} from 'react-icons/fa';
import './AdminPatients.css';

const AdminPatients = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const list = getPatients() || [];
    setPatients(list);
  }, []);

  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.id && p.id.toLowerCase().includes(query)) ||
      (p.disease && p.disease.toLowerCase().includes(query)) ||
      (p.address && p.address.toLowerCase().includes(query)) ||
      (p.doctor && p.doctor.toLowerCase().includes(query));

    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Critical': return 'badge badge-danger';
      case 'Active': return 'badge badge-warning';
      case 'Under Observation': return 'badge badge-info';
      case 'Recovered': return 'badge badge-success';
      default: return 'badge badge-primary';
    }
  };

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'Active' || p.status === 'Under Observation').length,
    critical: patients.filter(p => p.status === 'Critical').length,
    recovered: patients.filter(p => p.status === 'Recovered').length
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      <div className="dashboard-main">
        <DashboardHeader title="Patients Overview & Rural Demographics" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          <div className="admin-page-header">
            <div>
              <h2 className="admin-page-title">Master Patient Registry</h2>
              <p className="admin-page-subtitle">
                System-wide overview of consulted patients, clinical diagnoses, assigned physicians, and medication regimes.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-primary">
                <FaUserInjured />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Patients</span>
                <span className="stat-number">{stats.total}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-secondary">
                <FaHeartbeat />
              </div>
              <div className="stat-info">
                <span className="stat-label">Active Treatments</span>
                <span className="stat-number">{stats.active}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-danger">
                <FaHeartbeat />
              </div>
              <div className="stat-info">
                <span className="stat-label">Critical Status</span>
                <span className="stat-number">{stats.critical}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-success">
                <FaUserInjured />
              </div>
              <div className="stat-info">
                <span className="stat-label">Recovered</span>
                <span className="stat-number">{stats.recovered}</span>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="admin-controls-bar">
            <div className="search-bar-wrapper admin-search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search patient by name, ID, disease, or village..."
                className="form-control search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="admin-filter-tabs">
              <button 
                className={`admin-filter-tab ${selectedStatus === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('all')}
              >
                All Statuses ({stats.total})
              </button>
              <button 
                className={`admin-filter-tab ${selectedStatus === 'Active' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('Active')}
              >
                Active
              </button>
              <button 
                className={`admin-filter-tab ${selectedStatus === 'Critical' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('Critical')}
              >
                Critical ({stats.critical})
              </button>
              <button 
                className={`admin-filter-tab ${selectedStatus === 'Under Observation' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('Under Observation')}
              >
                Observation
              </button>
              <button 
                className={`admin-filter-tab ${selectedStatus === 'Recovered' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('Recovered')}
              >
                Recovered
              </button>
            </div>
          </div>

          {/* Patients Table */}
          <div className="table-responsive admin-users-table-container">
            {filteredPatients.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Patient Name</th>
                    <th>Age / Gender</th>
                    <th>Village Location</th>
                    <th>Diagnosis</th>
                    <th>Prescribed Meds</th>
                    <th>Attending Doctor</th>
                    <th>Status</th>
                    <th>Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => {
                    const meds = patient.medicines || [];
                    return (
                      <tr key={patient.id}>
                        <td className="font-weight-600">{patient.id}</td>
                        <td>
                          <strong>{patient.name}</strong>
                          {patient.bloodGroup && (
                            <span className="badge badge-info" style={{ marginLeft: '6px', fontSize: '0.68rem' }}>
                              {patient.bloodGroup}
                            </span>
                          )}
                        </td>
                        <td className="text-secondary">{patient.age} yrs / {patient.gender}</td>
                        <td className="text-secondary font-size-sm">
                          <FaMapMarkerAlt style={{ color: '#0f766e', marginRight: '4px' }} />
                          {patient.address || 'Rural PHC Sector'}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#0f766e' }}>
                            {patient.disease || 'General Consult'}
                          </span>
                        </td>
                        <td>
                          {meds.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', background: '#ccfbf1', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                                <FaPills /> {meds.length} Med{meds.length > 1 ? 's' : ''}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {meds.map(m => m.name).join(', ')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted font-size-sm">None</span>
                          )}
                        </td>
                        <td className="text-secondary">{patient.doctor || 'Dr. Sarah Paul'}</td>
                        <td>
                          <span className={getStatusBadgeClass(patient.status)}>
                            {patient.status}
                          </span>
                        </td>
                        <td className="text-secondary font-size-sm">{patient.lastVisit || '2026-08-10'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state-container" style={{ padding: '3rem', textAlign: 'center' }}>
                <FaUserInjured style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '1rem' }} />
                <h3>No patients found</h3>
                <p style={{ color: '#64748b' }}>Try adjusting your search criteria or status filter.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPatients;
