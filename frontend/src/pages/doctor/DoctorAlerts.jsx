import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { FaSearch, FaBell, FaExclamationTriangle, FaInfoCircle, FaPlusCircle } from 'react-icons/fa';
import './DoctorAlerts.css';
import { getRoleAlerts } from "../../services/api/alertService";

const DoctorAlerts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await getRoleAlerts('doctor');
        setAlerts(data);
      } catch (error) {
        console.error('Failed to load doctor alerts:', error);
      }
    };

    loadAlerts();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredAlerts = alerts.filter(alert =>
    `${alert.title} ${alert.description} ${alert.severity}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'Critical': return <FaPlusCircle className="alert-icon critical" />;
      case 'Warning': return <FaExclamationTriangle className="alert-icon warning" />;
      case 'Info': return <FaInfoCircle className="alert-icon medicine" />;
      default: return <FaBell className="alert-icon info" />;
    }
  };

  const getAlertBadgeClass = (severity) => {
    switch (severity) {
      case 'Critical': return 'badge badge-danger';
      case 'Warning': return 'badge badge-warning';
      case 'Info': return 'badge badge-success';
      default: return 'badge badge-primary';
    }
  };

  const formatAlertDate = (date) => {
    if (!date) return 'Recent alert';
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return date;
    return value.toLocaleString();
  };

  return (

    <div className="dashboard-layout">

      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={setSidebarOpen}
      />

      <div className="dashboard-main">

        <DashboardHeader
          title="System & Patient Alerts"
          toggleSidebar={setSidebarOpen}
        />

        <main className="dashboard-content">

          {/* SEARCH */}

          <div className="alerts-page-controls">

            <div className="search-bar-wrapper">

              <FaSearch className="search-icon" />

              <input
                type="text"
                placeholder="Search disease, village or medicine..."
                className="form-control search-input"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
              />

            </div>

          </div>

          <div className="alerts-full-container">
            {filteredAlerts.length > 0 ? (
              <div className="alerts-detailed-list">
                {filteredAlerts.map(alert => (
                  <div key={alert.id} className={`alert-detail-card alert-border-${alert.severity.toLowerCase()}`}>
                    <div className="alert-card-left">
                      {getAlertIcon(alert.severity)}
                      <div className="alert-card-content">
                        <h3 className="alert-card-title">{alert.title}</h3>
                        <p className="alert-card-msg">{alert.description}</p>
                        <span className="alert-card-timestamp">{formatAlertDate(alert.date)}</span>
                      </div>
                    </div>
                    <div className="alert-card-right">
                      <span className={getAlertBadgeClass(alert.severity)}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <DiseaseSeveritySection
                title="High"
                icon={<FaPlusCircle />}
                alerts={highDisease}
                className="severity-high"
              />

              <DiseaseSeveritySection
                title="Medium"
                icon={<FaExclamationTriangle />}
                alerts={mediumDisease}
                className="severity-medium"
              />

              <DiseaseSeveritySection
                title="Low"
                icon={<FaInfoCircle />}
                alerts={lowDisease}
                className="severity-low"
              />

            </section>


            {/* =================================================
                MEDICINE
            ================================================= */}

            <section className="alerts-panel medicine-panel">

              <div className="panel-heading">

                <div>

                  <h2>
                    Medicine Alerts
                  </h2>

                  <p>
                    Pharmacy stock monitoring
                  </p>

                </div>

                <FaCapsules />

              </div>

              {filteredMedicineAlerts.length > 0 ? (

                <div className="medicine-alert-list">

                  {filteredMedicineAlerts.map(
                    (alert, index) => (

                      <MedicineCard
                        key={
                          alert.Alert_ID ||
                          alert.alert_id ||
                          alert.id ||
                          index
                        }
                        alert={alert}
                      />

                    )
                  )}

                </div>

              ) : (

                <div className="medicine-empty">

                  <FaBell />

                  <p>
                    No medicine alerts
                  </p>

                </div>

              )}

            </section>

          </div>

        </main>

      </div>

    </div>

  );
};

export default DoctorAlerts;