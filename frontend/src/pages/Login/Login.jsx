import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getLoggedInUser } from '../../services/localStorageService';
import logo from '../../assets/logo/logo.png';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  return (
    <div className="auth-page auth-page-login">
      <div className="auth-shell">
        <aside className="auth-visual-panel auth-visual-login">
          <div className="auth-visual-overlay" />
          <div className="auth-visual-content">
            <span className="auth-visual-kicker">MediPredict</span>
            <h1>Smarter care starts with a cleaner workspace</h1>
            <p>
              Manage patients, alerts, and medicine stock from one branded portal designed for rural healthcare teams.
            </p>
            <div className="auth-visual-points">
              <span>Role-based dashboards</span>
              <span>Read-only stock for doctors</span>
              <span>Live alerts and forecasting</span>
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

          <div className="auth-card">
            <div className="auth-heading-block">
              <h2>Welcome back</h2>
              <p>Sign in to your secure workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="auth-message auth-message-error">{error}</div>}

              <div className="auth-form-group">
                <label htmlFor="email">Email Address</label>
                <div className="auth-input-wrapper">
                  <FaEnvelope className="auth-input-icon" />
                  <input
                    type="email"
                    id="email"
                    className="auth-input-field"
                    placeholder="doctor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <div className="auth-row-label">
                  <label htmlFor="password">Password</label>
                  <a href="#forgot" onClick={handleForgotPassword} className="auth-inline-link">
                    Forgot Password?
                  </a>
                </div>
                <div className="auth-input-wrapper">
                  <FaLock className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="auth-input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-footer-copy">
              <p>
                Don&apos;t have an account? <Link to="/signup" className="auth-inline-link">Create account</Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
