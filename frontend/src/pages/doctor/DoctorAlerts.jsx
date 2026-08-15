import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";

import {
  FaSearch,
  FaBell,
  FaExclamationTriangle,
  FaPlusCircle,
  FaInfoCircle,
  FaCapsules,
} from "react-icons/fa";

import "./DoctorAlerts.css";
import { getAlerts } from "../../services/api/alertService";

const DoctorAlerts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
  try {
    const data = await getAlerts();

    const alertData = Array.isArray(data)
      ? data
      : data.alerts || data.data || [];

    setAlerts(alertData);

  } catch (error) {
    console.error("Failed to load alerts:", error);
    setAlerts([]);
  }
};

  /* =====================================================
     HELPERS
  ===================================================== */

  const getCategory = (alert) => {
    return (
      alert.alert_category ||
      alert.Alert_Category ||
      alert.category ||
      ""
    ).toString().toUpperCase();
  };

  const getAlertType = (alert) => {
    return (
      alert.alert_type ||
      alert.Alert_Type ||
      alert.type ||
      ""
    ).toString().toUpperCase();
  };

  const getSeverity = (alert) => {
    return (
      alert.severity ||
      alert.Severity ||
      alert.risk_level ||
      alert.Risk_Level ||
      "LOW"
    ).toString().toUpperCase();
  };

  const getVillage = (alert) => {
    return (
      alert.village ||
      alert.Village ||
      "Unknown Village"
    );
  };

  const getDisease = (alert) => {
    return (
      alert.disease ||
      alert.Disease ||
      "Disease"
    );
  };

  const getMessage = (alert) => {
    return (
      alert.message ||
      alert.Alert_Message ||
      alert.alert_message ||
      "Alert information available."
    );
  };

  /* =====================================================
     GET PREDICTED CASES
  ===================================================== */

  const getPatients = (alert) => {
    const message = getMessage(alert);

    const match = message.match(
      /Predicted cases:\s*(\d+)/i
    );

    return match ? match[1] : "—";
  };

  /* =====================================================
     IDENTIFY DISEASE ALERTS
     
     IMPORTANT:
     Backend sends:
     Alert_Category = DISEASE
     Alert_Type = DISEASE_OUTBREAK
  ===================================================== */

  const isDiseaseAlert = (alert) => {
    const category = getCategory(alert);
    const type = getAlertType(alert);

    return (
      category === "DISEASE" ||
      type === "DISEASE_OUTBREAK" ||
      type.includes("DISEASE")
    );
  };

  /* =====================================================
     IDENTIFY MEDICINE ALERTS
     
     Backend sends:
     Alert_Category = MEDICINE

     Types:
     MEDICINE_LOW_STOCK
     MEDICINE_OUT_OF_STOCK
     MEDICINE_EXPIRED
  ===================================================== */

  const isMedicineAlert = (alert) => {
    const category = getCategory(alert);
    const type = getAlertType(alert);

    return (
      category === "MEDICINE" ||
      type === "MEDICINE_LOW_STOCK" ||
      type === "MEDICINE_OUT_OF_STOCK" ||
      type === "MEDICINE_EXPIRED"
    );
  };

  /* =====================================================
     SEPARATE ALERTS
  ===================================================== */

  const diseaseAlerts = alerts.filter(isDiseaseAlert);

  const medicineAlerts = alerts.filter(isMedicineAlert);

  /* =====================================================
     SEARCH
  ===================================================== */

  const matchesSearch = (alert) => {
    const searchableText = `
      ${getMessage(alert)}
      ${getDisease(alert)}
      ${getVillage(alert)}
      ${getAlertType(alert)}
      ${getCategory(alert)}
      ${alert.medicine || ""}
      ${alert.Medicine_Name || ""}
      ${alert.medicine_name || ""}
    `.toLowerCase();

    return searchableText.includes(
      searchQuery.toLowerCase()
    );
  };

  const filteredDiseaseAlerts =
    diseaseAlerts.filter(matchesSearch);

  const filteredMedicineAlerts =
    medicineAlerts.filter(matchesSearch);

  /* =====================================================
     DISEASE GROUPS
  ===================================================== */

  const highDisease =
    filteredDiseaseAlerts.filter(
      (alert) =>
        getSeverity(alert) === "HIGH" ||
        getSeverity(alert) === "DANGER"
    );

  const mediumDisease =
    filteredDiseaseAlerts.filter(
      (alert) =>
        getSeverity(alert) === "MEDIUM"
    );

  const lowDisease =
    filteredDiseaseAlerts.filter(
      (alert) =>
        getSeverity(alert) === "LOW"
    );

  /* =====================================================
     DISEASE CARD
  ===================================================== */

  const DiseaseCard = ({ alert }) => {
    return (
      <div className="disease-mini-card">

        <div>
          <strong>
            {getVillage(alert)}
          </strong>

          <div className="disease-name">
            {getDisease(alert)}
          </div>
        </div>

        <div className="patient-count">

          <strong>
            {getPatients(alert)}
          </strong>

          <span>
            patients
          </span>

        </div>

      </div>
    );
  };

  /* =====================================================
     DISEASE SECTION
  ===================================================== */

  const DiseaseSeveritySection = ({
    title,
    icon,
    alerts,
    className,
  }) => {

    return (
      <div
        className={`disease-severity-section ${className}`}
      >

        <div className="severity-header">

          <div className="severity-title">
            {icon}
            <span>
              {title}
            </span>
          </div>

          <span className="severity-count">
            {alerts.length}
          </span>

        </div>

        <div className="disease-list">

          {alerts.length > 0 ? (

            alerts.map((alert, index) => (

              <DiseaseCard
                key={
                  alert.Alert_ID ||
                  alert.alert_id ||
                  alert.id ||
                  index
                }
                alert={alert}
              />

            ))

          ) : (

            <div className="no-severity-alerts">
              No {title.toLowerCase()} disease alerts
            </div>

          )}

        </div>

      </div>
    );
  };

  /* =====================================================
     MEDICINE NAME
  ===================================================== */

  const getMedicineName = (alert) => {

    return (
      alert.medicine ||
      alert.Medicine_Name ||
      alert.medicine_name ||
      alert.name ||
      "Medicine"
    );

  };

  /* =====================================================
     MEDICINE STOCK
  ===================================================== */

  const getMedicineStock = (alert) => {

    if (
      alert.stock !== undefined &&
      alert.stock !== null
    ) {
      return alert.stock;
    }

    if (
      alert.Current_Stock !== undefined &&
      alert.Current_Stock !== null
    ) {
      return alert.Current_Stock;
    }

    if (
      alert.current_stock !== undefined &&
      alert.current_stock !== null
    ) {
      return alert.current_stock;
    }

    return null;
  };

  /* =====================================================
     MEDICINE ALERT TYPE
  ===================================================== */

  const getMedicineAlertTitle = (alert) => {

    const type = getAlertType(alert);

    if (type === "MEDICINE_OUT_OF_STOCK") {
      return "OUT OF STOCK";
    }

    if (type === "MEDICINE_EXPIRED") {
      return "EXPIRED";
    }

    if (type === "MEDICINE_LOW_STOCK") {
      return "LOW STOCK";
    }

    return "MEDICINE ALERT";
  };

  /* =====================================================
     MEDICINE ICON
  ===================================================== */

  const getMedicineIcon = (alert) => {

    const type = getAlertType(alert);

    if (
      type === "MEDICINE_OUT_OF_STOCK" ||
      type === "MEDICINE_EXPIRED"
    ) {
      return <FaExclamationTriangle />;
    }

    return <FaInfoCircle />;
  };

  /* =====================================================
     MEDICINE CARD
  ===================================================== */

  const MedicineCard = ({ alert }) => {

    const type = getAlertType(alert);

    const severity = getSeverity(alert);

    const medicine =
      getMedicineName(alert);

    const stock =
      getMedicineStock(alert);

    const title =
      getMedicineAlertTitle(alert);

    return (

      <div
        className={`medicine-alert-card medicine-${type.toLowerCase()}`}
      >

        <div className="medicine-alert-icon">

          {getMedicineIcon(alert)}

        </div>

        <div className="medicine-alert-content">

          <strong>
            {medicine}
          </strong>

          <span className="medicine-alert-title">
            {title}
          </span>

          <span>
            {getMessage(alert)}
          </span>

          {stock !== null && (

            <small>
              Current stock:{" "}
              <b>{stock}</b>
            </small>

          )}

        </div>

        <span
          className={`medicine-severity ${severity.toLowerCase()}`}
        >
          {severity}
        </span>

      </div>

    );
  };

  /* =====================================================
     PAGE
  ===================================================== */

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

          {/* =================================================
              SIDE BY SIDE
          ================================================= */}

          <div className="alerts-split-container">

            {/* =================================================
                DISEASE
            ================================================= */}

            <section className="alerts-panel disease-panel">

              <div className="panel-heading">

                <div>

                  <h2>
                    Disease Alerts
                  </h2>

                  <p>
                    Predicted disease activity by village
                  </p>

                </div>

                <FaBell />

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