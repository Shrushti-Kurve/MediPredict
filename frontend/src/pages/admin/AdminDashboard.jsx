import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import PowerBIEmbed from '../../components/PowerBIEmbed/PowerBIEmbed';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      <div className="dashboard-main">
        <DashboardHeader title="Admin Power BI Dashboard" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          <div className="powerbi-section-wrapper">
            <PowerBIEmbed role="admin" height="680px" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
