import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import DashboardHeader from '../components/DashboardHeader/DashboardHeader';
import { getLoggedInUser, updateUserProfile } from '../services/localStorageService';
import { FaUser, FaEnvelope, FaPhone, FaUserShield, FaSave } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loggedUser = getLoggedInUser();
    if (loggedUser) {
      setUser(loggedUser);
      setFormData({
        name: loggedUser.name || '',
        phone: loggedUser.phone || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.phone) {
      setError('Name and Phone are required.');
      return;
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    const updatePayload = {
      name: formData.name,
      phone: formData.phone
    };

    if (formData.password) {
      updatePayload.password = formData.password;
    }

    const updated = updateUserProfile(updatePayload);
    if (updated) {
      setUser(updated);
      setSuccess('Profile updated successfully.');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } else {
      setError('Failed to update profile.');
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'doctor') return 'Doctor';
    if (role === 'hospitalStaff') return 'Hospital Staff';
    if (role === 'pharmacist') return 'Pharmacist';
    if (role === 'admin') return 'Admin';
    return role;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (!user) return <div className="profile-loading">Loading Profile...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      <div className="dashboard-main">
        <DashboardHeader title="Profile Settings" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          <div className="profile-card-wrapper">
            <div className="profile-card-header-block">
              <div className="profile-avatar-large">
                {getInitials(user.name)}
              </div>
              <div className="profile-header-info">
                <h2>{user.name}</h2>
                <span className="badge badge-primary">{getRoleLabel(user.role)}</span>
              </div>
            </div>

            {error && <div className="profile-msg-error">{error}</div>}
            {success && <div className="profile-msg-success">{success}</div>}

            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div className="profile-form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <div className="profile-input-wrapper">
                    <FaUser className="profile-icon-input" />
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <div className="profile-input-wrapper">
                    <FaPhone className="profile-icon-input" />
                    <input
                      type="tel"
                      id="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="profile-form-row">
                <div className="form-group">
                  <label>Email Address (Read-Only)</label>
                  <div className="profile-input-wrapper">
                    <FaEnvelope className="profile-icon-input" />
                    <input
                      type="email"
                      className="form-control"
                      value={user.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Assigned Permission Role</label>
                  <div className="profile-input-wrapper">
                    <FaUserShield className="profile-icon-input" />
                    <input
                      type="text"
                      className="form-control"
                      value={getRoleLabel(user.role)}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="editable-section-title">Change Password</div>

              <div className="profile-form-row">
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Leave empty to keep current"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    className="form-control"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary profile-save-btn">
                <FaSave /> Save Profile Updates
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
