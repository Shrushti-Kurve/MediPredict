import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { 
  getMedicines, 
  addMedicine, 
  updateMedicine,
  dispenseMedicine,
  getPatients
} from '../../services/localStorageService';
import { 
  FaSearch, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaPlusCircle, 
  FaTimes,
  FaHandHoldingMedical,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import './MedicineStock.css';

const MedicineStock = ({ readOnly = false, title = 'Medicine Inventory', subtitle = 'Monitor stock, expiry, and availability at a glance.' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [qtyModalOpen, setQtyModalOpen] = useState(false);
  const [dispenseModalOpen, setDispenseModalOpen] = useState(false);

  const [selectedMed, setSelectedMed] = useState(null);
  const canEdit = !readOnly;

  // Form States
  const [medForm, setMedForm] = useState({
    id: '',
    name: '',
    category: '',
    description: '',
    quantity: 0,
    minimumStock: 0,
    expiryDate: '',
    supplier: ''
  });

  const [qtyValue, setQtyValue] = useState(0);
  const [qtyExpiryDate, setQtyExpiryDate] = useState('');
  const [medicineExpiryDate, setMedicineExpiryDate] = useState('');

  // Dispense Form State
  const [dispenseForm, setDispenseForm] = useState({
    quantity: 1,
    patientName: '',
    notes: ''
  });
  const [dispenseError, setDispenseError] = useState('');
  const [dispenseSuccess, setDispenseSuccess] = useState('');

  const loadMedicines = () => {
    setMedicines(getMedicines());
  };

  useEffect(() => {
    loadMedicines();
    setPatients(getPatients() || []);
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
      ? Math.max(...medicines.map(m => parseInt(m.id.replace('M', '')) || 2000)) + 1 
      : 2011;

    setMedForm({
      id: `M${nextNum}`,
      name: '',
      category: '',
      description: '',
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
      alert('Please fill out all required fields.');
      return;
    }
    
    addMedicine(medForm);
    loadMedicines();
    setAddModalOpen(false);
    alert('Medicine added to inventory database.');
  };

  const handleOpenEditModal = (med) => {
    setSelectedMed(med);
    setMedForm({ 
      ...med,
      description: med.description || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!medForm.name || !medForm.category || !medForm.supplier || !medForm.expiryDate) {
      alert('Please fill out all required fields.');
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
    setMedicineExpiryDate(med.expiryDate || '');
    setQtyExpiryDate(med.newStockExpiryDate || '');
    setQtyModalOpen(true);
  };

  const handleQtySubmit = (e) => {
    e.preventDefault();
    if (selectedMed) {
      if (!medicineExpiryDate) {
        alert('Please keep the original medicine expiry date or update it in the edit screen before adding new stock.');
        return;
      }

      if (!qtyExpiryDate) {
        alert('Please add the new stock batch expiry date for this medicine.');
        return;
      }

      const updated = {
        ...selectedMed,
        quantity: parseInt(qtyValue) >= 0 ? parseInt(qtyValue) : 0,
        expiryDate: medicineExpiryDate,
        newStockExpiryDate: qtyExpiryDate
      };
      updateMedicine(updated);
      loadMedicines();
      setQtyModalOpen(false);
      setSelectedMed(null);
      setMedicineExpiryDate('');
      setQtyExpiryDate('');
      alert('Medicine stock quantity and batch expiry date updated successfully.');
    }
  };

  // Dispense Handlers
  const handleOpenDispenseModal = (med) => {
    setSelectedMed(med);
    setDispenseForm({
      quantity: 1,
      patientName: '',
      notes: ''
    });
    setDispenseError('');
    setDispenseSuccess('');
    setDispenseModalOpen(true);
  };

  const handleDispenseSubmit = (e) => {
    e.preventDefault();
    setDispenseError('');
    setDispenseSuccess('');

    const reqQty = parseInt(dispenseForm.quantity);
    if (isNaN(reqQty) || reqQty <= 0) {
      setDispenseError('Please enter a valid quantity greater than 0.');
      return;
    }

    const available = parseInt(selectedMed?.quantity) || 0;
    if (reqQty > available) {
      setDispenseError(`Insufficient stock available. Only ${available} units currently in stock.`);
      return;
    }

    try {
      const updated = dispenseMedicine(selectedMed.id, reqQty, dispenseForm.patientName);
      loadMedicines();
      setSelectedMed(updated);
      setDispenseSuccess(`Successfully dispensed ${reqQty} units of ${selectedMed.name}. Remaining stock: ${updated.quantity} units.`);
      
      setTimeout(() => {
        setDispenseModalOpen(false);
        setDispenseSuccess('');
        setSelectedMed(null);
      }, 1200);
    } catch (err) {
      setDispenseError(err.message || 'Failed to dispense medicine.');
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
        <DashboardHeader title={title} toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          <section className={`stock-hero ${readOnly ? 'stock-hero-readonly' : ''}`}>
            <div className="stock-hero-copy">
              <span className="stock-hero-kicker">{readOnly ? 'Doctor Read-Only View' : 'Pharmacy Control Center'}</span>
              <h2>{title}</h2>
              <p>{readOnly ? 'Review availability, stock levels, and expiry dates. Inventory edits stay restricted to pharmacists.' : subtitle}</p>
            </div>
            <div className="stock-hero-badge">
              <span className="stock-hero-badge-label">Live Inventory</span>
              <strong>{medicines.length} Items</strong>
            </div>
          </section>

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
            {canEdit ? (
              <button className="btn btn-primary add-medicine-btn" onClick={handleOpenAddModal}>
                <FaPlus /> Add Medicine
              </button>
            ) : (
              <div className="stock-readonly-chip">Doctors can view only</div>
            )}
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
                    <th>Expiry Dates</th>
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
                        <td className="font-weight-600">
                          <span style={{ color: parseInt(med.quantity) === 0 ? '#dc2626' : (parseInt(med.quantity) <= parseInt(med.minimumStock) ? '#d97706' : '#0f766e') }}>
                            {med.quantity}
                          </span>
                        </td>
                        <td>{med.minimumStock}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span><strong>Medicine:</strong> {med.expiryDate || '—'}</span>
                            <span><strong>New Stock:</strong> {med.newStockExpiryDate || '—'}</span>
                          </div>
                        </td>
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
                              title="View Details & Uses"
                            >
                              <FaEye /> View
                            </button>
                            {canEdit && (
                              <>
                                <button 
                                  className="btn-action btn-dispense" 
                                  onClick={() => handleOpenDispenseModal(med)}
                                  title="Dispense to Patient"
                                  disabled={parseInt(med.quantity) === 0}
                                  style={{ opacity: parseInt(med.quantity) === 0 ? 0.5 : 1, cursor: parseInt(med.quantity) === 0 ? 'not-allowed' : 'pointer' }}
                                >
                                  <FaHandHoldingMedical /> Dispense
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
                              </>
                            )}
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

          {/* VIEW DETAILS MODAL (Includes Requirement 3: Medicine Description / Uses) */}
          {viewModalOpen && selectedMed && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '620px' }}>
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
                      <span className="detail-label">Medicine Type / Category</span>
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
                      <span className="detail-label">Medicine Expiry Date</span>
                      <span className="detail-val">{selectedMed.expiryDate || 'Not set'}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">New Stock Expiry Date</span>
                      <span className="detail-val">{selectedMed.newStockExpiryDate || 'Not set'}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Current Status</span>
                      <span className="detail-val">
                        <span className={getStatus(selectedMed).class}>
                          {getStatus(selectedMed).label}
                        </span>
                      </span>
                    </div>
                    
                    {/* MEDICINE DESCRIPTION / USES (Requirement 3) */}
                    <div className="detail-field detail-field-full" style={{ marginTop: '0.5rem' }}>
                      <span className="detail-label">Medicine Description / Uses</span>
                      <p className="detail-description-text">
                        {selectedMed.description || 'Used for therapeutic clinical management and treatment.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {canEdit && parseInt(selectedMed.quantity) > 0 && (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => { setViewModalOpen(false); handleOpenDispenseModal(selectedMed); }}
                      style={{ marginRight: 'auto' }}
                    >
                      <FaHandHoldingMedical /> Dispense Medicine
                    </button>
                  )}
                  <button className="btn btn-secondary" onClick={() => setViewModalOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* DISPENSE MEDICINE MODAL (Requirement 7: Pharmacist Stock Deduction) */}
          {canEdit && dispenseModalOpen && selectedMed && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '480px' }}>
                <div className="modal-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaHandHoldingMedical className="text-primary" /> Dispense Medicine
                  </h3>
                  <button className="modal-close-btn" onClick={() => setDispenseModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleDispenseSubmit}>
                  <div className="modal-body">
                    {dispenseError && (
                      <div className="auth-message auth-message-error" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaExclamationTriangle /> {dispenseError}
                      </div>
                    )}
                    {dispenseSuccess && (
                      <div className="auth-message auth-message-success" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaCheckCircle /> {dispenseSuccess}
                      </div>
                    )}

                    <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>MEDICINE</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{selectedMed.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#0f766e', fontWeight: 700, marginTop: '2px' }}>
                        Available in Stock: <strong>{selectedMed.quantity} units</strong>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="dispense-qty">Quantity to Dispense *</label>
                      <input
                        type="number"
                        id="dispense-qty"
                        className="form-control"
                        min="1"
                        max={selectedMed.quantity}
                        value={dispenseForm.quantity}
                        onChange={(e) => setDispenseForm({ ...dispenseForm, quantity: parseInt(e.target.value) || 0 })}
                        required
                        autoFocus
                      />
                      <small className="text-muted">Deducted immediately from current inventory.</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="dispense-patient">Patient Name / Record (Optional)</label>
                      <input
                        type="text"
                        id="dispense-patient"
                        className="form-control"
                        placeholder="e.g. Ramesh Kumar (P1001)"
                        value={dispenseForm.patientName}
                        onChange={(e) => setDispenseForm({ ...dispenseForm, patientName: e.target.value })}
                        list="patient-names-list"
                      />
                      <datalist id="patient-names-list">
                        {patients.map(p => (
                          <option key={p.id} value={`${p.name} (${p.id})`} />
                        ))}
                      </datalist>
                    </div>

                    <div className="form-group">
                      <label htmlFor="dispense-notes">Dispensing Notes / Dosage (Optional)</label>
                      <input
                        type="text"
                        id="dispense-notes"
                        className="form-control"
                        placeholder="e.g. Course for 5 days post-meal"
                        value={dispenseForm.notes}
                        onChange={(e) => setDispenseForm({ ...dispenseForm, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setDispenseModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={parseInt(selectedMed.quantity) === 0}>
                      Confirm & Deduct Stock
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ADD MEDICINE MODAL */}
          {canEdit && addModalOpen && (
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
                        <input type="text" id="name" className="form-control" placeholder="e.g. Paracetamol" value={medForm.name} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <input type="text" id="category" className="form-control" placeholder="e.g. Analgesic / Antibiotic" value={medForm.category} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="supplier">Supplier *</label>
                        <input type="text" id="supplier" className="form-control" placeholder="e.g. RuralPharma Ltd." value={medForm.supplier} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Medicine Description / Uses</label>
                      <textarea
                        id="description"
                        className="form-control"
                        rows="2"
                        placeholder="e.g. Used to reduce fever and relieve mild to moderate pain."
                        value={medForm.description}
                        onChange={handleInputChange}
                      />
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
          {canEdit && editModalOpen && selectedMed && (
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

                    <div className="form-group">
                      <label htmlFor="description">Medicine Description / Uses</label>
                      <textarea
                        id="description"
                        className="form-control"
                        rows="2"
                        placeholder="e.g. Used to reduce fever and relieve mild to moderate pain."
                        value={medForm.description}
                        onChange={handleInputChange}
                      />
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
          {canEdit && qtyModalOpen && selectedMed && (
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
                      <label htmlFor="quick-qty">Available Quantity *</label>
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

                    <div className="form-group">
                      <label htmlFor="medicine-expiry-date">Medicine Expiry Date *</label>
                      <input
                        type="date"
                        id="medicine-expiry-date"
                        className="form-control"
                        value={medicineExpiryDate}
                        onChange={(e) => setMedicineExpiryDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="quick-expiry-date">New Stock / Batch Expiry Date *</label>
                      <input
                        type="date"
                        id="quick-expiry-date"
                        className="form-control"
                        value={qtyExpiryDate}
                        onChange={(e) => setQtyExpiryDate(e.target.value)}
                        required
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
