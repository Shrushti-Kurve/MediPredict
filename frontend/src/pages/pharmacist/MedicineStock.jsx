import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { 
  getMedicines, 
  addMedicine, 
  updateMedicine 
} from '../../services/localStorageService';
import { FaSearch, FaPlus, FaEye, FaEdit, FaPlusCircle, FaTimes } from 'react-icons/fa';
import './MedicineStock.css';

const MedicineStock = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [qtyModalOpen, setQtyModalOpen] = useState(false);

  const [selectedMed, setSelectedMed] = useState(null);

  // Form States
  const [medForm, setMedForm] = useState({
    id: '',
    name: '',
    category: '',
    quantity: 0,
    minimumStock: 0,
    expiryDate: '',
    supplier: ''
  });

  const [qtyValue, setQtyValue] = useState(0);

  const loadMedicines = () => {
    setMedicines(getMedicines());
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setMedForm(prev => ({
      ...prev,
      [id]: id === 'quantity' || id === 'minimumStock' ? parseInt(value) || 0 : value
    }));
  };

  const handleOpenAddModal = () => {
    // Generate next ID
    const nextNum = medicines.length > 0 
      ? Math.max(...medicines.map(m => parseInt(m.id.replace('M', '')))) + 1 
      : 2011;

    setMedForm({
      id: `M${nextNum}`,
      name: '',
      category: '',
      quantity: 0,
      minimumStock: 0,
      expiryDate: '',
      supplier: ''
    });
    setAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!medForm.name || !medForm.category || !medForm.supplier || !medForm.expiryDate) {
      alert('Please fill out all fields.');
      return;
    }
    
    addMedicine(medForm);
    loadMedicines();
    setAddModalOpen(false);
    alert('Medicine added to inventory database.');
  };

  const handleOpenEditModal = (med) => {
    setSelectedMed(med);
    setMedForm({ ...med });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!medForm.name || !medForm.category || !medForm.supplier || !medForm.expiryDate) {
      alert('Please fill out all fields.');
      return;
    }

    updateMedicine(medForm);
    loadMedicines();
    setEditModalOpen(false);
    setSelectedMed(null);
    alert('Medicine details updated successfully.');
  };

  const handleOpenQtyModal = (med) => {
    setSelectedMed(med);
    setQtyValue(med.quantity);
    setQtyModalOpen(true);
  };

  const handleQtySubmit = (e) => {
    e.preventDefault();
    if (selectedMed) {
      const updated = {
        ...selectedMed,
        quantity: parseInt(qtyValue) >= 0 ? parseInt(qtyValue) : 0
      };
      updateMedicine(updated);
      loadMedicines();
      setQtyModalOpen(false);
      setSelectedMed(null);
      alert('Medicine stock quantity updated successfully.');
    }
  };

  const getStatus = (med) => {
    const qty = parseInt(med.quantity);
    const min = parseInt(med.minimumStock);
    
    if (qty === 0) {
      return { label: 'Out of Stock', class: 'badge badge-danger' };
    }
    if (qty <= min) {
      return { label: 'Low Stock', class: 'badge badge-warning' };
    }
    return { label: 'Available', class: 'badge badge-success' };
  };

  // Filter medicines
  const filteredMeds = medicines.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      <div className="dashboard-main">
        <DashboardHeader title="Medicine Inventory" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          <div className="stock-controls-bar">
            <div className="search-bar-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by ID, name, or category..."
                className="form-control search-input"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <button className="btn btn-primary add-medicine-btn" onClick={handleOpenAddModal}>
              <FaPlus /> Add Medicine
            </button>
          </div>

          <div className="table-responsive">
            {filteredMeds.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicine ID</th>
                    <th>Medicine Name</th>
                    <th>Category</th>
                    <th>Available Qty</th>
                    <th>Min Stock</th>
                    <th>Expiry Date</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeds.map(med => {
                    const status = getStatus(med);
                    return (
                      <tr key={med.id}>
                        <td className="font-weight-600">{med.id}</td>
                        <td className="font-weight-600">{med.name}</td>
                        <td>{med.category}</td>
                        <td className="font-weight-600">{med.quantity}</td>
                        <td>{med.minimumStock}</td>
                        <td>{med.expiryDate}</td>
                        <td>{med.supplier}</td>
                        <td>
                          <span className={status.class}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className="table-action-btns">
                            <button 
                              className="btn-action btn-view" 
                              onClick={() => { setSelectedMed(med); setViewModalOpen(true); }}
                              title="View Details"
                            >
                              <FaEye /> View
                            </button>
                            <button 
                              className="btn-action btn-edit" 
                              onClick={() => handleOpenEditModal(med)}
                              title="Edit Details"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button 
                              className="btn-action btn-qty" 
                              onClick={() => handleOpenQtyModal(med)}
                              title="Quick Update Quantity"
                            >
                              <FaPlusCircle /> Qty
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state-container">
                <p>No medicines found.</p>
              </div>
            )}
          </div>

          {/* VIEW DETAILS MODAL */}
          {viewModalOpen && selectedMed && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Medicine Information: {selectedMed.name}</h3>
                  <button className="modal-close-btn" onClick={() => setViewModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="patient-details-grid">
                    <div className="detail-field">
                      <span className="detail-label">Medicine ID</span>
                      <span className="detail-val">{selectedMed.id}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Medicine Name</span>
                      <span className="detail-val">{selectedMed.name}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Category</span>
                      <span className="detail-val">{selectedMed.category}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Supplier / Brand</span>
                      <span className="detail-val">{selectedMed.supplier}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Available Quantity</span>
                      <span className="detail-val highlight-val" style={{ display: 'inline-block', width: 'fit-content' }}>
                        {selectedMed.quantity} units
                      </span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Minimum Threshold Level</span>
                      <span className="detail-val">{selectedMed.minimumStock} units</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Expiry Date</span>
                      <span className="detail-val">{selectedMed.expiryDate}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Current Status</span>
                      <span className="detail-val">
                        <span className={getStatus(selectedMed).class}>
                          {getStatus(selectedMed).label}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setViewModalOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* ADD MEDICINE MODAL */}
          {addModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Add Medicine to Inventory</h3>
                  <button className="modal-close-btn" onClick={() => setAddModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-body">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="id">Medicine ID</label>
                        <input type="text" id="id" className="form-control" value={medForm.id} disabled />
                      </div>
                      <div className="form-group">
                        <label htmlFor="name">Medicine Name *</label>
                        <input type="text" id="name" className="form-control" value={medForm.name} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <input type="text" id="category" className="form-control" placeholder="e.g. Antibiotic" value={medForm.category} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="supplier">Supplier *</label>
                        <input type="text" id="supplier" className="form-control" value={medForm.supplier} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="quantity">Available Quantity *</label>
                        <input type="number" id="quantity" className="form-control" min="0" value={medForm.quantity} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="minimumStock">Minimum Stock Level *</label>
                        <input type="number" id="minimumStock" className="form-control" min="1" value={medForm.minimumStock} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="expiryDate">Expiry Date *</label>
                      <input type="date" id="expiryDate" className="form-control" value={medForm.expiryDate} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Medicine</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* EDIT MEDICINE MODAL */}
          {editModalOpen && selectedMed && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Edit Medicine: {selectedMed.name}</h3>
                  <button className="modal-close-btn" onClick={() => setEditModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-body">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="id">Medicine ID</label>
                        <input type="text" id="id" className="form-control" value={medForm.id} disabled />
                      </div>
                      <div className="form-group">
                        <label htmlFor="name">Medicine Name *</label>
                        <input type="text" id="name" className="form-control" value={medForm.name} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <input type="text" id="category" className="form-control" value={medForm.category} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="supplier">Supplier *</label>
                        <input type="text" id="supplier" className="form-control" value={medForm.supplier} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="quantity">Available Quantity *</label>
                        <input type="number" id="quantity" className="form-control" min="0" value={medForm.quantity} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="minimumStock">Minimum Stock Level *</label>
                        <input type="number" id="minimumStock" className="form-control" min="1" value={medForm.minimumStock} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="expiryDate">Expiry Date *</label>
                      <input type="date" id="expiryDate" className="form-control" value={medForm.expiryDate} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* UPDATE QUANTITY QUICK MODAL */}
          {qtyModalOpen && selectedMed && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                  <h3>Update Quantity</h3>
                  <button className="modal-close-btn" onClick={() => setQtyModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleQtySubmit}>
                  <div className="modal-body">
                    <p style={{ marginBottom: '1rem' }}>
                      Update current stock for <strong>{selectedMed.name}</strong>.
                    </p>
                    <div className="form-group">
                      <label htmlFor="quick-qty">Available Quantity</label>
                      <input
                        type="number"
                        id="quick-qty"
                        className="form-control"
                        min="0"
                        value={qtyValue}
                        onChange={(e) => setQtyValue(parseInt(e.target.value) || 0)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setQtyModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Update</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MedicineStock;
