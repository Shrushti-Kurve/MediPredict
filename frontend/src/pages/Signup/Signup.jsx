import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../services/localStorageService';
import logo from '../../assets/logo/logo.png';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock, FaUserTag } from 'react-icons/fa';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword, role } = formData;
    
    if (!name || !email || !phone || !password || !confirmPassword || !role) {
      return 'All fields are required.';
    }

    // Email format regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }

    // Phone format regex (numeric, minimum 10 digits)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s-()]/g, ''))) {
      return 'Please enter a valid phone number (10-15 digits).';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const { name, email, phone, password, role } = formData;
        signup({ name, email, phone, password, role });
        
        setSuccess('Registration successful! Redirecting to login...');
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: ''
        });

        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch (err) {
        setError(err.message || 'Registration failed. Try again.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-logo-section">
          <img src={logo} alt="MediPredict Logo" className="signup-logo" />
          <h2 className="signup-title">Join MediPredict</h2>
          <p className="signup-subtitle">A Rural Healthcare System</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && <div className="signup-error">{error}</div>}
          {success && <div className="signup-success">{success}</div>}

          <div className="signup-form-row">
            <div className="signup-form-group">
              <label htmlFor="name">Full Name</label>
              <div className="signup-input-wrapper">
                <FaUser className="signup-input-icon" />
                <input
                  type="text"
                  id="name"
                  className="signup-input-field"
                  placeholder="Dr. Sarah Paul"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="signup-form-group">
              <label htmlFor="role">Select Role</label>
              <div className="signup-input-wrapper">
                <FaUserTag className="signup-input-icon" />
                <select
                  id="role"
                  className="signup-input-field signup-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">-- Choose Role --</option>
                  <option value="doctor">Doctor</option>
                  <option value="hospitalStaff">Hospital Staff</option>
                  <option value="pharmacist">Pharmacist</option>
                </select>
              </div>
            </div>
          </div>

          <div className="signup-form-row">
            <div className="signup-form-group">
              <label htmlFor="email">Email Address</label>
              <div className="signup-input-wrapper">
                <FaEnvelope className="signup-input-icon" />
                <input
                  type="email"
                  id="email"
                  className="signup-input-field"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="signup-form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="signup-input-wrapper">
                <FaPhone className="signup-input-icon" />
                <input
                  type="tel"
                  id="phone"
                  className="signup-input-field"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="signup-form-row">
            <div className="signup-form-group">
              <label htmlFor="password">Password</label>
              <div className="signup-input-wrapper">
                <FaLock className="signup-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="signup-input-field"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="signup-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="signup-input-wrapper">
                <FaLock className="signup-input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="signup-input-field"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary signup-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account? <Link to="/login" className="login-link">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
