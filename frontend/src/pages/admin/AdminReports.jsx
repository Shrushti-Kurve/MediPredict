import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import PowerBIEmbed from '../../components/PowerBIEmbed/PowerBIEmbed';
import './AdminReports.css';

const AdminReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      <div className="dashboard-main">
        <DashboardHeader title="Master System Telemetry & Power BI Reports" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          <div className="admin-page-header">
            <div>
              <h2 className="admin-page-title">Power BI Intelligence & Analytics</h2>
              <p className="admin-page-subtitle">
                Consolidated administrative telemetry: user activity, village health trends, disease forecast accuracy, and supply chain logistics.
              </p>
            </div>
          </div>

          <div className="powerbi-section-wrapper">
            <PowerBIEmbed role="admin" height="680px" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminReports;
