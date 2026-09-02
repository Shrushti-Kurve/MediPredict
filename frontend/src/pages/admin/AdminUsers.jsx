import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { getUsers, signup, updateUserStatus } from '../../services/localStorageService';
import { 
  FaUsers, 
  FaSearch, 
  FaUserPlus, 
  FaUserMd, 
  FaUserNurse, 
  FaPills, 
  FaTimes
} from 'react-icons/fa';
import './AdminUsers.css';

const AdminUsers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'doctor',
    password: '',
    status: 'Active'
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const loadUsers = () => {
    const list = getUsers() || [];
    setUsers(list);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.id && u.id.toLowerCase().includes(query)) ||
      (u.phone && u.phone.toLowerCase().includes(query));
    return matchesRole && matchesSearch;
  });

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'Inactive' ? 'Active' : 'Inactive';
    updateUserStatus(user.id, newStatus);
    loadUsers();
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newUserForm.name || !newUserForm.email || !newUserForm.password || !newUserForm.role) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      signup({
        name: newUserForm.name,
        email: newUserForm.email,
        phone: newUserForm.phone || '9876543210',
        password: newUserForm.password,
        role: newUserForm.role,
        status: newUserForm.status || 'Active'
      });

      setFormSuccess(`User ${newUserForm.name} registered successfully.`);
      setNewUserForm({
        name: '',
        email: '',
        phone: '',
        role: 'doctor',
        password: '',
        status: 'Active'
      });

      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess('');
        loadUsers();
      }, 1000);
    } catch (err) {
      setFormError(err.message || 'Failed to create user.');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'doctor': return 'badge badge-primary';
      case 'hospitalStaff': return 'badge badge-info';
      case 'pharmacist': return 'badge badge-warning';
      case 'admin': return 'badge badge-success';
      default: return 'badge badge-secondary';
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'doctor': return 'Doctor';
      case 'hospitalStaff': return 'Hospital Staff';
      case 'pharmacist': return 'Pharmacist';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  const roleCounts = {
    all: users.length,
    doctor: users.filter(u => u.role === 'doctor').length,
    hospitalStaff: users.filter(u => u.role === 'hospitalStaff').length,
    pharmacist: users.filter(u => u.role === 'pharmacist').length,
    admin: users.filter(u => u.role === 'admin').length
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      <div className="dashboard-main">
        <DashboardHeader title="User Information & Access Control" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          {/* Header Action Bar */}
          <div className="admin-page-header">
            <div>
              <h2 className="admin-page-title">Registered System Users</h2>
              <p className="admin-page-subtitle">
                View and manage user accounts for doctors, hospital staff, pharmacists, and administrators.
              </p>
            </div>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <FaUserPlus /> Add New User
            </button>
          </div>

          {/* User Metrics Summary */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-primary">
                <FaUsers />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Registered</span>
                <span className="stat-number">{roleCounts.all}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-primary">
                <FaUserMd />
              </div>
              <div className="stat-info">
                <span className="stat-label">Doctors</span>
                <span className="stat-number">{roleCounts.doctor}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-secondary">
                <FaUserNurse />
              </div>
              <div className="stat-info">
                <span className="stat-label">Hospital Staff</span>
                <span className="stat-number">{roleCounts.hospitalStaff}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-warning">
                <FaPills />
              </div>
              <div className="stat-info">
                <span className="stat-label">Pharmacists</span>
                <span className="stat-number">{roleCounts.pharmacist}</span>
              </div>
            </div>
          </div>

          {/* Controls Bar: Search & Role Filter Tabs */}
          <div className="admin-controls-bar">
            <div className="search-bar-wrapper admin-search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by user name, email, ID or phone..."
                className="form-control search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="admin-filter-tabs">
              <button 
                className={`admin-filter-tab ${selectedRoleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedRoleFilter('all')}
              >
                All Users ({roleCounts.all})
              </button>
              <button 
                className={`admin-filter-tab ${selectedRoleFilter === 'doctor' ? 'active' : ''}`}
                onClick={() => setSelectedRoleFilter('doctor')}
              >
                Doctors ({roleCounts.doctor})
              </button>
              <button 
                className={`admin-filter-tab ${selectedRoleFilter === 'hospitalStaff' ? 'active' : ''}`}
                onClick={() => setSelectedRoleFilter('hospitalStaff')}
              >
                Hospital Staff ({roleCounts.hospitalStaff})
              </button>
              <button 
                className={`admin-filter-tab ${selectedRoleFilter === 'pharmacist' ? 'active' : ''}`}
                onClick={() => setSelectedRoleFilter('pharmacist')}
              >
                Pharmacists ({roleCounts.pharmacist})
              </button>
              <button 
                className={`admin-filter-tab ${selectedRoleFilter === 'admin' ? 'active' : ''}`}
                onClick={() => setSelectedRoleFilter('admin')}
              >
                Admins ({roleCounts.admin})
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-responsive admin-users-table-container">
            {filteredUsers.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Assigned Role</th>
                    <th>Account Status</th>
                    <th>Registration Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="font-weight-600">{user.id}</td>
                      <td>
                        <div className="user-name-cell">
                          <strong>{user.name}</strong>
                        </div>
                      </td>
                      <td className="text-secondary">{user.email}</td>
                      <td className="text-secondary">{user.phone || 'N/A'}</td>
                      <td>
                        <span className={getRoleBadgeClass(user.role)}>
                          {getRoleDisplay(user.role)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.status === 'Inactive' ? 'badge-danger' : 'badge-success'}`}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="text-secondary font-size-sm">
                        {user.registrationDate || '2026-01-15'}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn-status-toggle ${user.status === 'Inactive' ? 'btn-status-activate' : 'btn-status-deactivate'}`}
                          onClick={() => handleToggleStatus(user)}
                          title={`Click to ${user.status === 'Inactive' ? 'activate' : 'deactivate'} account`}
                        >
                          {user.status === 'Inactive' ? 'Activate' : 'Deactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state-container" style={{ padding: '3rem', textAlign: 'center' }}>
                <FaUsers style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '1rem' }} />
                <h3>No matching users found</h3>
                <p style={{ color: '#64748b' }}>Try adjusting your search criteria or role filters.</p>
              </div>
            )}
          </div>

          {/* Add New User Modal */}
          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3><FaUserPlus className="text-primary" /> Register New System User</h3>
                  <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleAddUserSubmit}>
                  <div className="modal-body">
                    {formError && <div className="auth-message auth-message-error" style={{ marginBottom: '1rem' }}>{formError}</div>}
                    {formSuccess && <div className="auth-message badge-success" style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px' }}>{formSuccess}</div>}

                    <div className="form-group">
                      <label htmlFor="modal-name">Full Name *</label>
                      <input
                        type="text"
                        id="modal-name"
                        className="form-control"
                        placeholder="e.g. Dr. Robert Chen"
                        value={newUserForm.name}
                        onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="modal-email">Email Address *</label>
                        <input
                          type="email"
                          id="modal-email"
                          className="form-control"
                          placeholder="user@example.com"
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="modal-phone">Phone Number</label>
                        <input
                          type="tel"
                          id="modal-phone"
                          className="form-control"
                          placeholder="9876543210"
                          value={newUserForm.phone}
                          onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="modal-role">System Role *</label>
                        <select
                          id="modal-role"
                          className="form-control"
                          value={newUserForm.role}
                          onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                        >
                          <option value="doctor">Doctor</option>
                          <option value="hospitalStaff">Hospital Staff</option>
                          <option value="pharmacist">Pharmacist</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="modal-password">Initial Password *</label>
                        <input
                          type="password"
                          id="modal-password"
                          className="form-control"
                          placeholder="Min 6 characters"
                          value={newUserForm.password}
                          onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <FaUserPlus /> Save User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;
