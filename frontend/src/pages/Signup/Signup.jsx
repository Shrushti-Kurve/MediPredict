import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../services/localStorageService';
import logo from '../../assets/logo/logo.png';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock, FaUserTag, FaArrowLeft } from 'react-icons/fa';
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
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
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
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const validateForm = () => {
    const { name, email, phone, password, confirmPassword, role } = formData;
    const errors = {};

    if (!name || !name.trim()) {
      errors.name = 'Please enter your name.';
    }

    if (!role) {
      errors.role = 'Please select your role.';
    }

    if (!email || !email.trim()) {
      errors.email = 'Please enter your email.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    const phoneClean = (phone || '').replace(/[\s-()]/g, '');
    if (!phone || !phone.trim()) {
      errors.phone = 'Please enter your phone number.';
    } else {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(phoneClean)) {
        errors.phone = 'Please enter a valid phone number (10-15 digits).';
      }
    }

    if (!password) {
      errors.password = 'Please enter your password.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
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

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  return (
    <div className="auth-page auth-page-signup">
      <div className="auth-shell">
        <aside className="auth-visual-panel auth-visual-signup">
          <div className="auth-visual-overlay" />
          <div className="auth-visual-content">
            <span className="auth-visual-kicker">Join MediPredict</span>
            <h1>Built for faster care and clearer teamwork</h1>
            <p>
              Create your account once and land in a workspace made for your role, with a smoother branded experience.
            </p>
            <div className="auth-visual-points">
              <span>Doctors</span>
              <span>Hospital Staff</span>
              <span>Pharmacists</span>
            </div>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-panel-topbar">
            <button type="button" className="auth-back-btn" onClick={handleGoBack} aria-label="Go back">
              <FaArrowLeft />
            </button>
            <Link to="/" className="auth-logo-link" aria-label="Go to home page">
              <img src={logo} alt="MediPredict Logo" className="auth-logo" />
            </Link>
          </div>

          <div className="auth-card auth-card-signup">
            <div className="auth-heading-block">
              <h2>Create your account</h2>
              <p>Register to access a smarter and more connected healthcare experience.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="auth-message auth-message-error">{error}</div>}
              {success && <div className="auth-message auth-message-success">{success}</div>}

              <div className="auth-form-row">
                <div className="auth-form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="auth-input-wrapper">
                    <FaUser className="auth-input-icon" />
                    <input
                      type="text"
                      id="name"
                      className={`auth-input-field ${fieldErrors.name ? 'auth-input-error' : ''}`}
                      placeholder="Enter yor name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  {fieldErrors.name && <span className="auth-field-error-text">{fieldErrors.name}</span>}
                </div>

                <div className="auth-form-group">
                  <label htmlFor="role">Select Role</label>
                  <div className="auth-input-wrapper">
                    <FaUserTag className="auth-input-icon" />
                    <select
                      id="role"
                      className={`auth-input-field auth-select ${fieldErrors.role ? 'auth-input-error' : ''}`}
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="">-- Choose Role --</option>
                      <option value="doctor">Doctor</option>
                      <option value="hospitalStaff">Hospital Staff</option>
                      <option value="pharmacist">Pharmacist</option>
                    </select>
                  </div>
                  {fieldErrors.role && <span className="auth-field-error-text">{fieldErrors.role}</span>}
                </div>
              </div>

              <div className="auth-form-row">
                <div className="auth-form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="auth-input-wrapper">
                    <FaEnvelope className="auth-input-icon" />
                    <input
                      type="email"
                      id="email"
                      className={`auth-input-field ${fieldErrors.email ? 'auth-input-error' : ''}`}
                      placeholder="Enter Your Name"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {fieldErrors.email && <span className="auth-field-error-text">{fieldErrors.email}</span>}
                </div>

                <div className="auth-form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="auth-input-wrapper">
                    <FaPhone className="auth-input-icon" />
                    <input
                      type="tel"
                      id="phone"
                      className={`auth-input-field ${fieldErrors.phone ? 'auth-input-error' : ''}`}
                      placeholder="Enter Your Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  {fieldErrors.phone && <span className="auth-field-error-text">{fieldErrors.phone}</span>}
                </div>
              </div>

              <div className="auth-form-row">
                <div className="auth-form-group">
                  <label htmlFor="password">Password</label>
                  <div className="auth-input-wrapper">
                    <FaLock className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className={`auth-input-field ${fieldErrors.password ? 'auth-input-error' : ''}`}
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {fieldErrors.password && <span className="auth-field-error-text">{fieldErrors.password}</span>}
                </div>

                <div className="auth-form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="auth-input-wrapper">
                    <FaLock className="auth-input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className={`auth-input-field ${fieldErrors.confirmPassword ? 'auth-input-error' : ''}`}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <span className="auth-field-error-text">{fieldErrors.confirmPassword}</span>}
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>

            <div className="auth-footer-copy">
              <p>
                Already have an account? <Link to="/login" className="auth-inline-link">Login</Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Signup;
