import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import logo from '../../assets/logo/logo.png';
import {
  FaBell,
  FaChartLine,
  FaCapsules,
  FaUserInjured,
  FaStethoscope,
  FaShieldAlt,
  FaArrowRight,
  FaPhoneAlt,
  FaEnvelope
} from 'react-icons/fa';
import './Home.css';

const uspCards = [
  {
    icon: FaBell,
    title: 'Instant Alerts',
    text: 'Low-stock, critical, and follow-up alerts stay visible before issues build up.',
  },
  {
    icon: FaChartLine,
    title: 'Disease Forecasting',
    text: 'Spot patterns early and plan care around likely demand, not guesswork.',
  },
  {
    icon: FaCapsules,
    title: 'Medicine Stock',
    text: 'See inventory health, expiry windows, and medicine availability in one place.',
  },
  {
    icon: FaUserInjured,
    title: 'Patient Flow',
    text: 'Keep patient records, visits, and treatment history organized and easy to scan.',
  },
  {
    icon: FaStethoscope,
    title: 'Doctor Workspace',
    text: 'Doctors get a focused workspace for patients, prescriptions, and clinical review.',
  },
  {
    icon: FaShieldAlt,
    title: 'Role-Based Access',
    text: 'Each user sees only the tools they need, which keeps the workflow simple and safe.',
  },
];

const roleCards = [
  {
    title: 'Doctor',
    text: 'Review patients, prescriptions, alerts, and medicine stock in a clean clinical space.',
  },
  {
    title: 'Hospital Staff',
    text: 'Manage patient records and admissions without touching medicine editing tools.',
  },
  {
    title: 'Pharmacist',
    text: 'Handle stock updates, expiry checks, and inventory changes from one dashboard.',
  },
];

const Home = () => {
  return (
    <div className="home-page-wrapper">
      <Header />

      <section className="hero-section" id="hero">
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />
        <div className="container hero-container">
          <div className="hero-logo-wrapper">
            <img src={logo} alt="MediPredict Logo" className="hero-logo" />
          </div>
          <div className="hero-badge">Rural Healthcare System</div>
          <h1 className="hero-title">A calmer way to manage rural care</h1>
          <p className="hero-subtitle">
            MediPredict brings alerts, disease forecasting, medicine stock, and patient workspaces together in one place.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary hero-btn-get-started">Get Started</Link>
            <a href="#usp" className="btn btn-secondary hero-btn-learn-more">Explore Features</a>
          </div>
        </div>
      </section>

      <section className="usp-section" id="usp">
        <div className="container">
          <div className="section-header-block">
            <span className="section-kicker">Core USP</span>
            <h2 className="section-title">What makes MediPredict useful</h2>
            <p className="section-desc">A focused set of tools built around the realities of rural healthcare teams.</p>
          </div>

          <div className="usp-grid">
            {uspCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="usp-card">
                  <div className="usp-icon-wrap">
                    <Icon />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="workflow-section">
        <div className="container">
          <div className="section-header-block light">
            <span className="section-kicker light">Simple flow</span>
            <h2 className="section-title text-white">How people use it</h2>
            <p className="section-desc text-white">Short steps, clear roles, and no extra page hopping.</p>
          </div>

          <div className="workflow-grid">
            <div className="workflow-card">
              <div className="workflow-pill">01</div>
              <h4>Create an account</h4>
              <p>Register as doctor, staff, or pharmacist depending on the role.</p>
            </div>
            <div className="workflow-card">
              <div className="workflow-pill">02</div>
              <h4>Sign in once</h4>
              <p>Land in the right workspace automatically after login.</p>
            </div>
            <div className="workflow-card">
              <div className="workflow-pill">03</div>
              <h4>Work in one place</h4>
              <p>Use the sidebar after sign-in to keep navigation fast and focused.</p>
            </div>
            <div className="workflow-card">
              <div className="workflow-pill">04</div>
              <h4>Stay alerted</h4>
              <p>Watch stock, disease, and patient signals without digging through multiple screens.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="roles-section" id="roles">
        <div className="container">
          <div className="section-header-block">
            <span className="section-kicker">Access by role</span>
            <h2 className="section-title">Each user sees the right tools</h2>
            <p className="section-desc">No clutter, no unnecessary edit rights, and no confusing switches.</p>
          </div>

          <div className="roles-grid">
            {roleCards.map((role) => (
              <article key={role.title} className="role-card-display">
                <div className="role-card-glow" />
                <h3>{role.title}</h3>
                <p>{role.text}</p>
                <Link to="/login" className="role-action-link">Open workspace <FaArrowRight /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="connect-section" id="connect">
        <div className="container connect-panel">
          <div>
            <span className="section-kicker">Need help</span>
            <h2 className="section-title">Connect with the team directly</h2>
            <p className="section-desc">You can keep this on the home page instead of sending people to a separate contact screen.</p>
          </div>
          <div className="connect-actions">
            <a className="connect-chip" href="tel:+919876543210"><FaPhoneAlt /> +91 98765-43210</a>
            <a className="connect-chip" href="mailto:support@medipredict.org"><FaEnvelope /> support@medipredict.org</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
