import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { 
  getPatients, 
  getMedicines, 
  prescribeMedicines 
} from '../../services/localStorageService';
import { 
  FaSearch, 
  FaEye, 
  FaTimes, 
  FaPlus, 
  FaTrash, 
  FaPills, 
  FaPrescriptionBottleAlt, 
  FaUserMd,
  FaFilePrescription,
  FaPrint
} from 'react-icons/fa';
import './DoctorPatients.css';

const FREQUENCY_OPTIONS = [
  'Twice daily (1-0-1 - After Food)',
  'Thrice daily (1-1-1 - After Food)',
  'Once daily (1-0-0 - Morning / Empty Stomach)',
  'Once daily (0-0-1 - Bedtime)',
  'Four times daily (1-1-1-1)',
  'SOS (As needed for pain/fever)',
  'Alternate days (1-0-0)',
  'Weekly once'
];

const DURATION_OPTIONS = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '30 days',
  '45 days',
  '60 days',
  '90 days',
  'Ongoing (Chronic)'
];

const DoctorPatients = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [pharmacyStock, setPharmacyStock] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Clinical edit form state
  const [editForm, setEditForm] = useState({
    id: '',
    disease: '',
    status: 'Active',
    nextVisit: '',
    clinicalNotes: ''
  });

  // Dynamic Multiple Medicines state for the prescription
  const [prescribedMeds, setPrescribedMeds] = useState([]);

  const loadData = () => {
    setPatients(getPatients());
    setPharmacyStock(getMedicines());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter patients based on query
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery) ||
    (patient.disease && patient.disease.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenViewModal = (patient) => {
    setSelectedPatient(patient);
    setViewModalOpen(true);
  };

  const handleOpenEditModal = (patient) => {
    setSelectedPatient(patient);
    setEditForm({
      id: patient.id,
      disease: patient.disease || '',
      status: patient.status || 'Active',
      nextVisit: patient.nextVisit || '',
      clinicalNotes: patient.clinicalNotes || ''
    });

    // Populate multi-medicine list from existing record
    if (patient.medicines && patient.medicines.length > 0) {
      setPrescribedMeds(patient.medicines.map((m, idx) => ({
        id: m.id || `MED-${Date.now()}-${idx}`,
        name: m.name || '',
        dosage: m.dosage || '',
        frequency: m.frequency || '',
        duration: m.duration || '',
        quantity: m.quantity !== undefined && m.quantity !== null ? m.quantity : '',
        instructions: m.instructions || ''
      })));
    } else {
      // Default with 1 clean empty medicine row ready for manual doctor input
      setPrescribedMeds([
        {
          id: `MED-${Date.now()}-0`,
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          quantity: '',
          instructions: ''
        }
      ]);
    }

    setEditModalOpen(true);
  };

  // Prescription Dynamic List Handlers - Starts blank for manual input
  const handleAddMedicineRow = () => {
    setPrescribedMeds(prev => [
      ...prev,
      {
        id: `MED-${Date.now()}-${prev.length}`,
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: '',
        instructions: ''
      }
    ]);
  };

  const handleRemoveMedicineRow = (index) => {
    if (prescribedMeds.length <= 1) {
      // Reset the single row to blank instead of deleting everything
      setPrescribedMeds([
        {
          id: `MED-${Date.now()}-0`,
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          quantity: '',
          instructions: ''
        }
      ]);
      return;
    }
    setPrescribedMeds(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedFieldChange = (index, field, value) => {
    setPrescribedMeds(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    if (!editForm.disease || !editForm.disease.trim()) {
      alert('Please provide a diagnosed disease or condition.');
      return;
    }

    // Filter out rows that have medication name entered
    const filledMeds = prescribedMeds.filter(m => m.name && m.name.trim().length > 0);
    
    if (filledMeds.length === 0) {
      alert('Please manually enter at least one medicine name in the prescription.');
      return;
    }

    // Ensure numeric quantity with default fallback of 1
    const finalizedMeds = filledMeds.map((m, idx) => ({
      id: m.id || `MED-${Date.now()}-${idx}`,
      name: m.name.trim(),
      dosage: m.dosage ? m.dosage.trim() : 'As directed',
      frequency: m.frequency ? m.frequency.trim() : 'As directed',
      duration: m.duration ? m.duration.trim() : 'As prescribed',
      quantity: parseInt(m.quantity) > 0 ? parseInt(m.quantity) : 1,
      instructions: m.instructions ? m.instructions.trim() : 'Follow physician instructions'
    }));

    const updated = prescribeMedicines(editForm.id, {
      medicines: finalizedMeds,
      disease: editForm.disease.trim(),
      notes: editForm.clinicalNotes,
      status: editForm.status
    });

    if (updated) {
      loadData();
      setEditModalOpen(false);
      setSelectedPatient(null);
      alert(`Prescription for ${updated.name} successfully updated with ${finalizedMeds.length} medication(s).`);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Critical': return 'badge badge-danger';
      case 'Active': return 'badge badge-warning';
      case 'Under Observation': return 'badge badge-info';
      case 'Recovered': return 'badge badge-success';
      default: return 'badge badge-primary';
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />
      
      <div className="dashboard-main">
        <DashboardHeader title="Doctor Consultation & Prescriptions" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          <div className="doctor-patients-controls">
            <div className="search-bar-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search patient by ID, name, diagnosis, or phone..."
                className="form-control search-input"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="table-responsive">
            {filteredPatients.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age / Gender</th>
                    <th>Phone</th>
                    <th>Diagnosis</th>
                    <th>Prescriptions (Multi-Med)</th>
                    <th>Last Consultation</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(patient => {
                    const meds = patient.medicines || [];
                    return (
                      <tr key={patient.id}>
                        <td className="font-weight-600">{patient.id}</td>
                        <td className="font-weight-600">{patient.name}</td>
                        <td>{patient.age} yrs / {patient.gender}</td>
                        <td>{patient.phone}</td>
                        <td>
                          <span className="disease-highlight">{patient.disease || 'Unspecified'}</span>
                        </td>
                        <td>
                          <div className="doc-prescriptions-cell">
                            {meds.length > 0 ? (
                              <div className="doc-meds-summary">
                                <span className="doc-med-badge">
                                  <FaPills /> {meds.length} Med{meds.length > 1 ? 's' : ''}
                                </span>
                                <div className="doc-med-names-preview">
                                  {meds.map((m, i) => (
                                    <span key={i} className="med-tag-pill">
                                      {m.name} {m.dosage ? `(${m.dosage})` : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted font-size-sm">No Meds Prescribed</span>
                            )}
                          </div>
                        </td>
                        <td>{patient.lastVisit}</td>
                        <td>
                          <span className={getStatusBadgeClass(patient.status)}>
                            {patient.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-action-btns">
                            <button 
                              className="btn-action btn-view" 
                              title="View Patient Info & Rx Slip"
                              onClick={() => handleOpenViewModal(patient)}
                            >
                              <FaEye /> View Rx
                            </button>
                            <button 
                              className="btn-action btn-edit" 
                              title="Prescribe / Update Multiple Medicines"
                              onClick={() => handleOpenEditModal(patient)}
                            >
                              <FaFilePrescription /> Prescribe
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
                <p>No matching patient records found.</p>
              </div>
            )}
          </div>

          {/* VIEW DETAILS & PRESCRIPTION SLIP MODAL */}
          {viewModalOpen && selectedPatient && (
            <div className="modal-overlay">
              <div className="modal-content doc-rx-modal">
                <div className="modal-header">
                  <div className="modal-header-titles">
                    <h3>Prescription Record & Clinical Summary</h3>
                    <span className="text-muted font-size-sm">Patient: {selectedPatient.name} ({selectedPatient.id})</span>
                  </div>
                  <button className="modal-close-btn" onClick={() => setViewModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body">
                  {/* Prescription Slip Card */}
                  <div className="rx-slip-card">
                    <div className="rx-slip-header">
                      <div className="rx-doctor-info">
                        <h4><FaUserMd className="text-primary" /> {selectedPatient.doctor || 'Dr. Sarah Paul, MD'}</h4>
                        <span>General & Rural Healthcare Physician • Reg #MP-2026-884</span>
                      </div>
                      <div className="rx-symbol">℞</div>
                    </div>

                    <div className="rx-patient-meta-grid">
                      <div><strong>Patient:</strong> {selectedPatient.name}</div>
                      <div><strong>Age / Gender:</strong> {selectedPatient.age} yrs / {selectedPatient.gender}</div>
                      <div><strong>Phone:</strong> {selectedPatient.phone}</div>
                      <div><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</div>
                      <div><strong>Diagnosis:</strong> <span className="text-primary font-weight-700">{selectedPatient.disease}</span></div>
                      <div><strong>Last Visit:</strong> {selectedPatient.lastVisit}</div>
                    </div>

                    <div className="rx-table-section">
                      <h4 className="rx-section-title"><FaPills /> Prescribed Medications</h4>
                      {selectedPatient.medicines && selectedPatient.medicines.length > 0 ? (
                        <div className="table-responsive">
                          <table className="rx-medicines-table">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Medicine Name</th>
                                <th>Dosage</th>
                                <th>Frequency</th>
                                <th>Duration</th>
                                <th>Qty</th>
                                <th>Instructions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPatient.medicines.map((med, idx) => (
                                <tr key={idx}>
                                  <td>{idx + 1}</td>
                                  <td className="font-weight-700 text-primary">{med.name}</td>
                                  <td>{med.dosage || '500mg'}</td>
                                  <td>{med.frequency}</td>
                                  <td>{med.duration}</td>
                                  <td><strong>{med.quantity}</strong></td>
                                  <td className="text-muted">{med.instructions}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted" style={{ fontStyle: 'italic', padding: '0.75rem 0' }}>
                          No medications prescribed for this patient.
                        </p>
                      )}
                    </div>

                    {selectedPatient.clinicalNotes && (
                      <div className="rx-notes-section">
                        <strong>Doctor Clinical Notes:</strong>
                        <p>{selectedPatient.clinicalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => window.print()}
                  >
                    <FaPrint /> Print Rx Slip
                  </button>
                  <button className="btn btn-secondary" onClick={() => setViewModalOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* PRESCRIBE / EDIT MULTIPLE MEDICINES MODAL */}
          {editModalOpen && selectedPatient && (
            <div className="modal-overlay">
              <div className="modal-content doc-prescribe-modal" style={{ maxWidth: '850px' }}>
                <div className="modal-header">
                  <div>
                    <h3>Prescribe Medications: {selectedPatient.name}</h3>
                    <span className="text-muted font-size-sm">Patient ID: {selectedPatient.id} • Age: {selectedPatient.age} yrs • Blood Group: {selectedPatient.bloodGroup}</span>
                  </div>
                  <button className="modal-close-btn" onClick={() => setEditModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handlePrescriptionSubmit}>
                  <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                    
                    {/* Clinical Overview Row */}
                    <div className="form-row">
                      <div className="form-group" style={{ flex: 2 }}>
                        <label htmlFor="disease">Clinical Diagnosis / Condition *</label>
                        <input
                          type="text"
                          id="disease"
                          className="form-control"
                          placeholder="e.g. Hypertension & Type 2 Diabetes"
                          value={editForm.disease}
                          onChange={(e) => setEditForm(prev => ({ ...prev, disease: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="status">Patient Status *</label>
                        <select
                          id="status"
                          className="form-control"
                          value={editForm.status}
                          onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                          required
                        >
                          <option value="Active">Active</option>
                          <option value="Under Observation">Under Observation</option>
                          <option value="Recovered">Recovered</option>
                          <option value="Critical">Critical (Flag Risk)</option>
                        </select>
                      </div>
                    </div>

                    {/* Prescription Builder Section */}
                    <div className="rx-builder-section">
                      <div className="rx-builder-header">
                        <div>
                          <h4 className="rx-builder-title">
                            <FaPrescriptionBottleAlt className="text-primary" /> Multiple Medicine Prescription ({prescribedMeds.length})
                          </h4>
                          <span className="text-muted font-size-sm">Add, remove, or adjust dosages for each medicine given to patient</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm add-med-btn"
                          onClick={handleAddMedicineRow}
                        >
                          <FaPlus /> Add Medicine
                        </button>
                      </div>

                      {/* Pharmacy Available Medicines Datalist for Autocomplete */}
                      <datalist id="pharmacyMedicinesList">
                        {pharmacyStock.map(med => (
                          <option key={med.id} value={med.name}>
                            {med.name} ({med.category}) - {med.quantity} in stock
                          </option>
                        ))}
                      </datalist>

                      {/* Frequency Suggestions Datalist */}
                      <datalist id="frequencyOptionsList">
                        {FREQUENCY_OPTIONS.map((freq, i) => (
                          <option key={i} value={freq} />
                        ))}
                      </datalist>

                      {/* Duration Suggestions Datalist */}
                      <datalist id="durationOptionsList">
                        {DURATION_OPTIONS.map((dur, i) => (
                          <option key={i} value={dur} />
                        ))}
                      </datalist>

                      {/* Dynamic Medicine Rows */}
                      <div className="rx-med-cards-container">
                        {prescribedMeds.map((med, index) => (
                          <div key={med.id || index} className="rx-med-card">
                            <div className="rx-med-card-header">
                              <span className="rx-med-number">Medicine #{index + 1}</span>
                              <button
                                type="button"
                                className="btn-delete-med"
                                onClick={() => handleRemoveMedicineRow(index)}
                                title={prescribedMeds.length > 1 ? "Remove this medicine" : "Clear fields"}
                                aria-label="Remove medicine"
                              >
                                <FaTrash /> {prescribedMeds.length > 1 ? 'Remove' : 'Clear'}
                              </button>
                            </div>

                            <div className="rx-med-card-grid">
                              {/* Medicine Name - Full manual text input with stock suggestions */}
                              <div className="form-group med-name-field">
                                <label>Medicine Name *</label>
                                <input
                                  type="text"
                                  list="pharmacyMedicinesList"
                                  className="form-control"
                                  placeholder="Type medicine name (e.g. Paracetamol, Amoxicillin)"
                                  value={med.name}
                                  onChange={(e) => handleMedFieldChange(index, 'name', e.target.value)}
                                  required
                                />
                              </div>

                              {/* Dosage - Manual text input */}
                              <div className="form-group">
                                <label>Dosage</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g. 500mg, 1 tab, 10ml"
                                  value={med.dosage}
                                  onChange={(e) => handleMedFieldChange(index, 'dosage', e.target.value)}
                                />
                              </div>

                              {/* Frequency - Manual text input with suggestion options */}
                              <div className="form-group med-freq-field">
                                <label>Frequency</label>
                                <input
                                  type="text"
                                  list="frequencyOptionsList"
                                  className="form-control"
                                  placeholder="e.g. 1-0-1, Twice daily, SOS"
                                  value={med.frequency}
                                  onChange={(e) => handleMedFieldChange(index, 'frequency', e.target.value)}
                                />
                              </div>

                              {/* Duration - Manual text input with suggestion options */}
                              <div className="form-group">
                                <label>Duration</label>
                                <input
                                  type="text"
                                  list="durationOptionsList"
                                  className="form-control"
                                  placeholder="e.g. 5 days, 10 days, 1 month"
                                  value={med.duration}
                                  onChange={(e) => handleMedFieldChange(index, 'duration', e.target.value)}
                                />
                              </div>

                              {/* Quantity - Manual number input */}
                              <div className="form-group med-qty-field">
                                <label>Quantity *</label>
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control"
                                  placeholder="e.g. 10"
                                  value={med.quantity}
                                  onChange={(e) => handleMedFieldChange(index, 'quantity', e.target.value)}
                                  required
                                />
                              </div>

                              {/* Instructions - Manual text input */}
                              <div className="form-group med-inst-field">
                                <label>Special Instructions</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g. Take after meals with warm water"
                                  value={med.instructions}
                                  onChange={(e) => handleMedFieldChange(index, 'instructions', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rx-builder-footer">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleAddMedicineRow}
                        >
                          <FaPlus /> Add Another Medication
                        </button>
                      </div>
                    </div>

                    {/* Clinical Notes */}
                    <div className="form-group" style={{ marginTop: '1.25rem' }}>
                      <label htmlFor="clinicalNotes">Doctor Clinical Notes / Dietary Advice</label>
                      <textarea
                        id="clinicalNotes"
                        className="form-control"
                        rows="3"
                        placeholder="Additional recommendations, dietary restrictions, or follow-up milestones..."
                        value={editForm.clinicalNotes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      <FaFilePrescription /> Issue & Save Prescription
                    </button>
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

export default DoctorPatients;

