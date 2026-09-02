import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { getMedicines } from '../../services/localStorageService';
import { 
  FaPills, 
  FaSearch, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimesCircle,
  FaBoxes,
  FaTruck
} from 'react-icons/fa';
import './AdminMedicines.css';

const AdminMedicines = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStockFilter, setSelectedStockFilter] = useState('all');

  useEffect(() => {
    const list = getMedicines() || [];
    setMedicines(list);
  }, []);

  const getStockStatus = (med) => {
    const qty = parseInt(med.quantity || med.Current_Stock || 0);
    const min = parseInt(med.minimumStock || med.Reorder_Level || 0);
    if (qty === 0) return 'Out of Stock';
    if (qty <= min) return 'Low Stock';
    return 'Available';
  };

  const filteredMedicines = medicines.filter((med) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (med.name && med.name.toLowerCase().includes(query)) ||
      (med.id && med.id.toLowerCase().includes(query)) ||
      (med.category && med.category.toLowerCase().includes(query)) ||
      (med.supplier && med.supplier.toLowerCase().includes(query));

    const status = getStockStatus(med);
    const matchesFilter = selectedStockFilter === 'all' || 
      (selectedStockFilter === 'available' && status === 'Available') ||
      (selectedStockFilter === 'low' && status === 'Low Stock') ||
      (selectedStockFilter === 'out' && status === 'Out of Stock');

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (med) => {
    const status = getStockStatus(med);
    if (status === 'Out of Stock') {
      return <span className="badge badge-danger">Out of Stock</span>;
    }
    if (status === 'Low Stock') {
      return <span className="badge badge-warning">Low Stock</span>;
    }
    return <span className="badge badge-success">Available</span>;
  };

  const stats = {
    total: medicines.length,
    available: medicines.filter(m => getStockStatus(m) === 'Available').length,
    low: medicines.filter(m => getStockStatus(m) === 'Low Stock').length,
    out: medicines.filter(m => getStockStatus(m) === 'Out of Stock').length
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      <div className="dashboard-main">
        <DashboardHeader title="Medicine Inventory & Supply Chain Overview" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          <div className="admin-page-header">
            <div>
              <h2 className="admin-page-title">Master Medicine Directory</h2>
              <p className="admin-page-subtitle">
                Comprehensive overview of pharmacy stocks, minimum reorder thresholds, suppliers, and batch expiration dates.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-primary">
                <FaBoxes />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Catalogued</span>
                <span className="stat-number">{stats.total}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-success">
                <FaCheckCircle />
              </div>
              <div className="stat-info">
                <span className="stat-label">Available Stocks</span>
                <span className="stat-number">{stats.available}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-warning">
                <FaExclamationTriangle />
              </div>
              <div className="stat-info">
                <span className="stat-label">Low Stock Items</span>
                <span className="stat-number">{stats.low}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-danger">
                <FaTimesCircle />
              </div>
              <div className="stat-info">
                <span className="stat-label">Stockout / Depleted</span>
                <span className="stat-number">{stats.out}</span>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="admin-controls-bar">
            <div className="search-bar-wrapper admin-search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search medicine by name, category, or supplier..."
                className="form-control search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="admin-filter-tabs">
              <button 
                className={`admin-filter-tab ${selectedStockFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedStockFilter('all')}
              >
                All Medicines ({stats.total})
              </button>
              <button 
                className={`admin-filter-tab ${selectedStockFilter === 'available' ? 'active' : ''}`}
                onClick={() => setSelectedStockFilter('available')}
              >
                Available ({stats.available})
              </button>
              <button 
                className={`admin-filter-tab ${selectedStockFilter === 'low' ? 'active' : ''}`}
                onClick={() => setSelectedStockFilter('low')}
              >
                Low Stock ({stats.low})
              </button>
              <button 
                className={`admin-filter-tab ${selectedStockFilter === 'out' ? 'active' : ''}`}
                onClick={() => setSelectedStockFilter('out')}
              >
                Out of Stock ({stats.out})
              </button>
            </div>
          </div>

          {/* Medicines Table */}
          <div className="table-responsive admin-users-table-container">
            {filteredMedicines.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicine ID</th>
                    <th>Medicine Name</th>
                    <th>Therapeutic Category</th>
                    <th>Current Stock</th>
                    <th>Reorder Level</th>
                    <th>Stock Status</th>
                    <th>Batch Expiry</th>
                    <th>Authorized Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.map((med) => (
                    <tr key={med.id}>
                      <td className="font-weight-600">{med.id}</td>
                      <td>
                        <strong>{med.name}</strong>
                      </td>
                      <td className="text-secondary">{med.category || 'General Therapeutic'}</td>
                      <td>
                        <span style={{ 
                          fontWeight: 700, 
                          color: parseInt(med.quantity) === 0 ? '#dc2626' : (parseInt(med.quantity) <= parseInt(med.minimumStock) ? '#f59e0b' : '#0f766e') 
                        }}>
                          {med.quantity} units
                        </span>
                      </td>
                      <td className="text-secondary">{med.minimumStock || 0} units</td>
                      <td>{getStatusBadge(med)}</td>
                      <td className="text-secondary font-size-sm">{med.expiryDate || '2027-12-31'}</td>
                      <td className="text-secondary font-size-sm">
                        <FaTruck style={{ marginRight: '5px', color: '#64748b' }} />
                        {med.supplier || 'RuralPharma Ltd.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state-container" style={{ padding: '3rem', textAlign: 'center' }}>
                <FaPills style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '1rem' }} />
                <h3>No medicines found</h3>
                <p style={{ color: '#64748b' }}>Try adjusting your search criteria or stock filter.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminMedicines;
