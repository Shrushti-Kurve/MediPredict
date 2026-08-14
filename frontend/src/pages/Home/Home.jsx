import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import logo from '../../assets/logo/logo.png';
import { 
  FaUserInjured, 
  FaUserMd, 
  FaPills, 
  FaExclamationTriangle, 
  FaHospitalSymbol, 
  FaGlobeAsia,
  FaUserPlus,
  FaSignInAlt,
  FaFolderOpen,
  FaDesktop
} from 'react-icons/fa';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page-wrapper">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-logo-wrapper">
            <img src={logo} alt="MediPredict Hospital Logo" className="hero-logo" />
          </div>
          <h1 className="hero-title">Smarter Healthcare for Rural Communities</h1>
          <p className="hero-subtitle">
            MediPredict helps healthcare teams manage patients, medicines, and hospital operations efficiently.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary hero-btn-get-started">Get Started</Link>
            <Link to="/about" className="btn btn-secondary hero-btn-learn-more">Learn More</Link>
          </div>
        </div>
      </section>

      {/* Healthcare Features Grid */}
      <section className="features-section">
        <div className="container">
          <div className="section-header-block">
            <h2 className="section-title">Healthcare Features</h2>
            <p className="section-desc">Designed to address the specific challenges of rural clinical workflows.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper"><FaUserInjured /></div>
              <h3>Patient Management</h3>
              <p>Efficiently manage and maintain patient information.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper"><FaUserMd /></div>
              <h3>Doctor Management</h3>
              <p>Allow doctors to manage patient diseases and prescriptions.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper"><FaPills /></div>
              <h3>Medicine Management</h3>
              <p>Track medicine quantities and availability.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper"><FaExclamationTriangle /></div>
              <h3>Medicine Alerts</h3>
              <p>Identify medicines that are low in stock or unavailable.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper"><FaHospitalSymbol /></div>
              <h3>Hospital Operations</h3>
              <p>Help hospital staff maintain organized patient records.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper"><FaGlobeAsia /></div>
              <h3>Rural Healthcare</h3>
              <p>Support better healthcare management for rural communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How MediPredict Works */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header-block">
            <h2 className="section-title text-white">How MediPredict Works</h2>
            <p className="section-desc text-white">Follow a structured workflow to streamline clinical services.</p>
          </div>
          
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon"><FaUserPlus /></div>
              <h4>Create Account</h4>
              <p>Register as a Doctor, Hospital Staff member, or Pharmacist.</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon"><FaSignInAlt /></div>
              <h4>Login by Role</h4>
              <p>Access your dedicated workspace immediately after login.</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon"><FaFolderOpen /></div>
              <h4>Manage Information</h4>
              <p>Hospital staff manage patient records, and doctors prescribe medicine.</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-icon"><FaDesktop /></div>
              <h4>Monitor Actions</h4>
              <p>Pharmacists track medication stocks, triggering auto-alerts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Access Section */}
      <section className="roles-section">
        <div className="container">
          <div className="section-header-block">
            <h2 className="section-title">Healthcare Workspaces</h2>
            <p className="section-desc">We support three primary user roles to coordinate rural medical service delivery.</p>
          </div>
          
          <div className="roles-grid">
            <div className="role-card-display">
              <div className="role-icon-wrapper"><FaUserMd /></div>
              <h3>Doctor</h3>
              <p>Manage patient medical information, diseases, and medicines.</p>
              <Link to="/login" className="role-action-link">Access Workspace &rarr;</Link>
            </div>
            
            <div className="role-card-display">
              <div className="role-icon-wrapper"><FaHospitalSymbol /></div>
              <h3>Hospital Staff</h3>
              <p>Manage complete patient records and hospital information.</p>
              <Link to="/login" className="role-action-link">Access Workspace &rarr;</Link>
            </div>
            
            <div className="role-card-display">
              <div className="role-icon-wrapper"><FaPills /></div>
              <h3>Pharmacist</h3>
              <p>Manage medicine inventory and medicine stock alerts.</p>
              <Link to="/login" className="role-action-link">Access Workspace &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
