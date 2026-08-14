import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const validateForm = () => {
    const { name, email, phone, subject, message } = formData;
    if (!name || !email || !phone || !subject || !message) {
      return 'Please fill in all fields.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s-()]/g, ''))) {
      return 'Please enter a valid phone number (10-15 digits).';
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    // Mimic API delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 600);
  };

  return (
    <div className="contact-page-wrapper">
      <Header />

      <section className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Get in touch with the MediPredict coordination and operations team.</p>
        </div>
      </section>

      <section className="contact-body-section">
        <div className="container contact-grid">
          {/* Left Column: Contact Info */}
          <div className="contact-info-column">
            <h2>Contact Information</h2>
            <p className="contact-info-desc">
              Have questions about registration, medical permissions, or stock configurations? Reach out to our coordination desk.
            </p>

            <div className="contact-info-details">
              <div className="contact-detail-item">
                <div className="contact-item-icon"><FaMapMarkerAlt /></div>
                <div>
                  <h4>Hospital Address</h4>
                  <p>Community Health Center, Village Sonpur, Bihar, 841101</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-item-icon"><FaPhone /></div>
                <div>
                  <h4>Phone Numbers</h4>
                  <p>Primary Support: +91 98765-43210</p>
                  <p>Emergency Line: +91 98765-43999 (24/7)</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-item-icon"><FaEnvelope /></div>
                <div>
                  <h4>Email Addresses</h4>
                  <p>General Queries: support@medipredict.org</p>
                  <p>Pharmacy Admin: inventory@medipredict.org</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="contact-item-icon"><FaClock /></div>
                <div>
                  <h4>Working Hours</h4>
                  <p>Monday - Saturday: 9:00 AM - 5:00 PM</p>
                  <p>Emergency Clinic Services: Open 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-column">
            <h2>Send a Message</h2>
            
            {error && <div className="contact-error">{error}</div>}
            {success && (
              <div className="contact-success">
                Your message has been sent successfully. We will get back to you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-control"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  className="form-control"
                  placeholder="What is this regarding?"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  className="form-control"
                  rows="5"
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary contact-submit-btn" disabled={loading}>
                {loading ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
