import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import PowerBIEmbed from '../../components/PowerBIEmbed/PowerBIEmbed';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      <div className="dashboard-main">
        <DashboardHeader title="Doctor Power BI Dashboard" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          <div className="powerbi-section-wrapper">
            <PowerBIEmbed role="doctor" height="680px" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
