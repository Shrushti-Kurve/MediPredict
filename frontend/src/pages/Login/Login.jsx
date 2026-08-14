import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getLoggedInUser } from '../../services/localStorageService';
import logo from '../../assets/logo/logo.png';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    const user = getLoggedInUser();
    if (user) {
      if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'hospitalStaff') navigate('/hospital/dashboard');
      else if (user.role === 'pharmacist') navigate('/pharmacist/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    // Mimic brief loading state for professional feel
    setTimeout(() => {
      const user = login(email, password);
      setLoading(false);
      if (user) {
        if (user.role === 'doctor') {
          navigate('/doctor/dashboard');
        } else if (user.role === 'hospitalStaff') {
          navigate('/hospital/dashboard');
        } else if (user.role === 'pharmacist') {
          navigate('/pharmacist/dashboard');
        }
      } else {
        setError('Invalid email or password.');
      }
    }, 600);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Password reset link has been sent to your registered email address.');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo-section">
          <img src={logo} alt="MediPredict Logo" className="login-logo" />
          <h2 className="login-title">MediPredict</h2>
          <p className="login-subtitle">A Rural Healthcare System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="login-form-group">
            <label htmlFor="email">Email Address</label>
            <div className="login-input-wrapper">
              <FaEnvelope className="login-input-icon" />
              <input
                type="email"
                id="email"
                className="login-input-field"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="login-form-group">
            <div className="login-password-label-row">
              <label htmlFor="password">Password</label>
              <a href="#forgot" onClick={handleForgotPassword} className="forgot-password-link">
                Forgot Password?
              </a>
            </div>
            <div className="login-input-wrapper">
              <FaLock className="login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="login-input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
