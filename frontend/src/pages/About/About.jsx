import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { FaUserInjured, FaSearchPlus, FaHandsHelping, FaLaptopMedical, FaBell } from 'react-icons/fa';
import './About.css';

const About = () => {
  return (
    <div className="about-page-wrapper">
      <Header />

      {/* About Section */}
      <section className="about-hero-section">
        <div className="container">
          <h1 className="about-title">About MediPredict</h1>
          <p className="about-tagline">Empowering rural medical units with coordinated operations management.</p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision-section">
        <div className="container mv-grid">
          <div className="mv-card mission-card">
            <h2>Our Mission</h2>
            <p>
              To improve healthcare management in rural communities by providing easy-to-use digital tools that bridge logistical gaps, streamline patient charting, and prevent medication stock shortages.
            </p>
          </div>
          <div className="mv-card vision-card">
            <h2>Our Vision</h2>
            <p>
              To make vital healthcare information easier to manage, share, and access for healthcare professionals in remote, under-resourced medical facilities, fostering better clinical outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Purpose Explanation */}
      <section className="about-purpose-section">
        <div className="container purpose-container">
          <div className="purpose-text">
            <h2>Bridging the Rural Health Gap</h2>
            <p>
              Rural healthcare centers face unique challenges: limited networks, paper-heavy documentation, and erratic supply chains. MediPredict is custom-designed for these clinics. By providing unified workspaces for doctors, administrative staff, and pharmacists, the system reduces clinical friction.
            </p>
            <p>
              Doctors get direct access to update prescriptions, staff members maintain detailed demographic data, and pharmacists receive instant automated notifications when stocks drop below minimum safe levels.
            </p>
          </div>
        </div>
      </section>

      {/* Why MediPredict Section */}
      <section className="why-section">
        <div className="container">
          <h2 className="why-title">Why MediPredict?</h2>
          
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon-wrapper"><FaUserInjured /></div>
              <h3>Better Patient Management</h3>
              <p>Efficiently catalog medical background details, medication logs, and clinical history in one location.</p>
            </div>

            <div className="why-card">
              <div className="why-icon-wrapper"><FaSearchPlus /></div>
              <h3>Medicine Monitoring</h3>
              <p>Maintain tight control over pharmacy inventories, monitoring categories and expiry ranges.</p>
            </div>

            <div className="why-card">
              <div className="why-icon-wrapper"><FaHandsHelping /></div>
              <h3>Healthcare Coordination</h3>
              <p>Facilitate cross-role collaboration between doctors, front desk registrars, and pharmacists.</p>
            </div>

            <div className="why-card">
              <div className="why-icon-wrapper"><FaLaptopMedical /></div>
              <h3>Reduced Manual Work</h3>
              <p>Transition from error-prone physical ledgers to structured digital tables with search capabilities.</p>
            </div>

            <div className="why-card">
              <div className="why-icon-wrapper"><FaBell /></div>
              <h3>Medicine Stock Alerts</h3>
              <p>Receive proactive warnings when essential medicines drop below minimum thresholds or go out of stock.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
