import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-section">
          <h3 className="footer-brand-name">MediPredict</h3>
          <p className="footer-brand-subtitle">A Rural Healthcare System</p>
          <p className="footer-brand-desc">
            Empowering rural communities with advanced healthcare prediction, patient diagnostics, and medicine stock management solutions.
          </p>
          <div className="footer-social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
          </div>
        </div>

        <div className="footer-links-section">
          <h4 className="footer-section-title">Quick Links</h4>
          <ul className="footer-links-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </ul>
        </div>

        <div className="footer-links-section">
          <h4 className="footer-section-title">Healthcare Roles</h4>
          <ul className="footer-links-list">
            <li><Link to="/login">Doctor Access</Link></li>
            <li><Link to="/login">Hospital Staff Access</Link></li>
            <li><Link to="/login">Pharmacist Access</Link></li>
          </ul>
        </div>

        <div className="footer-contact-section">
          <h4 className="footer-section-title">Contact Us</h4>
          <ul className="footer-contact-list">
            <li>
              <FaMapMarkerAlt className="contact-icon" />
              <span>Community Health Center, Village Sonpur, Bihar, 841101</span>
            </li>
            <li>
              <FaPhone className="contact-icon" />
              <span>+91 98765-43210</span>
            </li>
            <li>
              <FaEnvelope className="contact-icon" />
              <span>support@medipredict.org</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p>&copy; 2026 MediPredict. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
