import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import {
  FaSearch,
  FaBell,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPlusCircle,
} from "react-icons/fa";

import "./PharmacistAlerts.css";
import { getAlerts } from "../../services/api/alertService";

const PharmacistAlerts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await getAlerts();

      console.log("ALERT DATA FROM BACKEND:", data);

      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load alerts:", error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredAlerts = alerts.filter((alert) => {
    const search = searchQuery.toLowerCase();

    return (
      String(alert.Alert_Message || "")
        .toLowerCase()
        .includes(search) ||
      String(alert.Disease || "")
        .toLowerCase()
        .includes(search) ||
      String(alert.Village || "")
        .toLowerCase()
        .includes(search) ||
      String(alert.Alert_Type || "")
        .toLowerCase()
        .includes(search) ||
      String(alert.Severity || "")
        .toLowerCase()
        .includes(search)
    );
  });

  /* =====================================================
     SEPARATE DISEASE / MEDICINE
  ===================================================== */

  const diseaseAlerts = filteredAlerts.filter(
    (alert) =>
      String(alert.Alert_Category || "").toUpperCase() === "DISEASE"
  );

  const medicineAlerts = filteredAlerts.filter(
    (alert) =>
      String(alert.Alert_Category || "").toUpperCase() === "MEDICINE"
  );

  /* =====================================================
     ONLY HIGH + MEDIUM DISEASE ALERTS
  ===================================================== */

  const highDisease = diseaseAlerts.filter(
    (alert) => String(alert.Severity).toUpperCase() === "HIGH"
  );

  const mediumDisease = diseaseAlerts.filter(
    (alert) => String(alert.Severity).toUpperCase() === "MEDIUM"
  );

  /* =====================================================
     MEDICINE TYPES
  ===================================================== */

  const expiredMedicine = medicineAlerts.filter(
    (alert) =>
      String(alert.Alert_Type).toUpperCase() === "MEDICINE_EXPIRED"
  );

  const outOfStockMedicine = medicineAlerts.filter(
    (alert) =>
      String(alert.Alert_Type).toUpperCase() ===
      "MEDICINE_OUT_OF_STOCK"
  );

  const lowStockMedicine = medicineAlerts.filter(
    (alert) =>
      String(alert.Alert_Type).toUpperCase() ===
      "MEDICINE_LOW_STOCK"
  );

  /* =====================================================
     ICON
  ===================================================== */

  const getDiseaseIcon = (severity) => {
    if (severity === "HIGH") {
      return <FaPlusCircle />;
    }

    return <FaExclamationTriangle />;
  };

  /* =====================================================
     DISEASE CARD
  ===================================================== */

  const DiseaseCard = ({ alert }) => (
    <div className="disease-mini-card">

      <div>
        <strong>
          {alert.Village || "Unknown Village"}
        </strong>

        <div className="disease-name">
          {alert.Disease || "Disease Forecast"}
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#9ca3af",
            marginTop: "4px",
          }}
        >
          {alert.Alert_Message}
        </div>
      </div>

      <div className="patient-count">

        <strong>
          {(() => {
            const message = alert.Alert_Message || "";

            const match = message.match(
              /(?:Predicted cases|predicted patients|patients):?\s*(\d+)/i
            );

            return match ? match[1] : "—";
          })()}
        </strong>

        <span>
          predicted
        </span>

      </div>

    </div>
  );

  /* =====================================================
     DISEASE SECTION
  ===================================================== */

  const DiseaseSection = ({
    title,
    alerts,
    className,
  }) => (

    <div className={`disease-severity-section ${className}`}>

      <div className="severity-header">

        <div className="severity-title">

          {getDiseaseIcon(title.toUpperCase())}

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

          alerts.map((alert) => (
            <DiseaseCard
              key={alert.Alert_ID}
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

  /* =====================================================
     MEDICINE CARD
  ===================================================== */

  const MedicineCard = ({ alert }) => {

    const type = String(
      alert.Alert_Type || ""
    ).toUpperCase();

    let title = "Medicine Alert";

    if (type === "MEDICINE_EXPIRED") {
      title = "Expired Medicine";
    }

    if (type === "MEDICINE_OUT_OF_STOCK") {
      title = "Out of Stock";
    }

    if (type === "MEDICINE_LOW_STOCK") {
      title = "Low Stock";
    }

    return (

      <div className="medicine-alert-card">

        <div className="medicine-alert-icon">

          {alert.Severity === "HIGH" ? (
            <FaExclamationTriangle />
          ) : (
            <FaInfoCircle />
          )}

        </div>

        <div className="medicine-alert-content">

          <strong>
            {title}
          </strong>

          <span>
            {alert.Alert_Message}
          </span>

          <small>
            {alert.Alert_Date
              ? new Date(
                  alert.Alert_Date
                ).toLocaleString()
              : ""}
          </small>

        </div>

        <span
          className={`medicine-severity ${
            String(alert.Severity || "").toLowerCase()
          }`}
        >
          {alert.Severity}

        </span>

      </div>

    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

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

            <div className="alerts-empty-state">
              <FaBell className="empty-bell" />

              <h3>
                Loading alerts...
              </h3>

            </div>

          </main>

        </div>

      </div>

    );
  }

  /* =====================================================
     MAIN
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
                    Important predicted disease activity
                  </p>

                </div>

                <FaBell />

              </div>


              <DiseaseSection
                title="High"
                alerts={highDisease}
                className="severity-high"
              />


              <DiseaseSection
                title="Medium"
                alerts={mediumDisease}
                className="severity-medium"
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

                <FaInfoCircle />

              </div>


              <div className="medicine-alert-list">

                {expiredMedicine.map((alert) => (
                  <MedicineCard
                    key={alert.Alert_ID}
                    alert={alert}
                  />
                ))}


                {outOfStockMedicine.map((alert) => (
                  <MedicineCard
                    key={alert.Alert_ID}
                    alert={alert}
                  />
                ))}


                {lowStockMedicine.map((alert) => (
                  <MedicineCard
                    key={alert.Alert_ID}
                    alert={alert}
                  />
                ))}


                {medicineAlerts.length === 0 && (

                  <div className="medicine-empty">

                    <FaBell />

                    <p>
                      No medicine alerts
                    </p>

                  </div>

                )}

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>

  );
};

export default PharmacistAlerts;