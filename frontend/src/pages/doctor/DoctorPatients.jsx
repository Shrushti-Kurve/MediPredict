import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import { 
  getPatients, 
  prescribeMedicines, 
  getMedicines 
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
  FaPrint,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    id: '',
    disease: '',
    symptoms: '',
    clinicalNotes: ''
  });

  const [prescribedMeds, setPrescribedMeds] = useState([]);

  // =====================================================
  // LOAD PATIENTS + MEDICINES (Synchronized data source)
  // =====================================================
  const loadData = () => {
    try {
      setLoading(true);
      const patientsData = getPatients() || [];
      const medicinesData = getMedicines() || [];
      setPatients(patientsData);
      setPharmacyStock(medicinesData);
    } catch (err) {
      console.error('LOAD DATA ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================
  const filteredPatients = patients.filter(patient => {
    const name = String(patient.name || '').toLowerCase();
    const id = String(patient.id || '').toLowerCase();
    const address = String(patient.address || '').toLowerCase();
    const disease = String(patient.disease || '').toLowerCase();
    const phone = String(patient.phone || '');
    const query = searchQuery.toLowerCase().trim();

    return (
      !query ||
      name.includes(query) ||
      id.includes(query) ||
      address.includes(query) ||
      disease.includes(query) ||
      phone.includes(query)
    );
  });

  // =====================================================
  // VIEW PATIENT
  // =====================================================
  const handleOpenViewModal = (patient) => {
    setSelectedPatient(patient);
    setViewModalOpen(true);
  };

  // =====================================================
  // OPEN PRESCRIPTION
  // =====================================================
  const handleOpenEditModal = (patient) => {
    setSelectedPatient(patient);

    setEditForm({
      id: patient.id,
      disease: patient.disease || '',
      symptoms: patient.symptoms || '',
      clinicalNotes: patient.clinicalNotes || ''
    });

    if (patient.medicines && patient.medicines.length > 0) {
      setPrescribedMeds(
        patient.medicines.map((m, idx) => ({
          id: m.id || `MED-${Date.now()}-${idx}`,
          medicineId: m.medicineId || m.id || '',
          name: m.name || '',
          dosage: m.dosage || '',
          frequency: m.frequency || '',
          duration: m.duration || '',
          quantity: m.quantity || 1,
          instructions: m.instructions || ''
        }))
      );
    } else {
      setPrescribedMeds([
        {
          id: `MED-${Date.now()}`,
          medicineId: '',
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          quantity: 1,
          instructions: ''
        }
      ]);
    }

    setEditModalOpen(true);
  };

  // =====================================================
  // ADD MEDICINE ROW
  // =====================================================
  const handleAddMedicineRow = () => {
    setPrescribedMeds(prev => [
      ...prev,
      {
        id: `MED-${Date.now()}-${prev.length}`,
        medicineId: '',
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: 1,
        instructions: ''
      }
    ]);
  };

  // =====================================================
  // REMOVE MEDICINE ROW
  // =====================================================
  const handleRemoveMedicineRow = (index) => {
    if (prescribedMeds.length === 1) {
      setPrescribedMeds([
        {
          id: `MED-${Date.now()}`,
          medicineId: '',
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          quantity: 1,
          instructions: ''
        }
      ]);
      return;
    }

    setPrescribedMeds(prev => prev.filter((_, i) => i !== index));
  };

  // =====================================================
  // MEDICINE FIELD CHANGE
  // =====================================================
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

  // =====================================================
  // MEDICINE SELECTION
  // =====================================================
  const handleMedicineSelect = (index, medIdentifier) => {
    const medObj = pharmacyStock.find(
      m => String(m.id) === String(medIdentifier) || m.name === medIdentifier
    );

    setPrescribedMeds(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        medicineId: medObj ? medObj.id : medIdentifier,
        name: medObj ? medObj.name : medIdentifier
      };
      return updated;
    });
  };

  // =====================================================
  // PRESCRIPTION SUBMIT
  // =====================================================
  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();

    if (!editForm.disease.trim()) {
      alert('Please enter the clinical diagnosis.');
      return;
    }

    const validMeds = prescribedMeds.filter(
      med => (med.name || med.medicineId) && Number(med.quantity) > 0
    );

    if (validMeds.length === 0) {
      alert('Please select or specify at least one medicine.');
      return;
    }

    try {
      prescribeMedicines(selectedPatient.id, {
        disease: editForm.disease,
        symptoms: editForm.symptoms,
        notes: editForm.clinicalNotes,
        medicines: validMeds
      });

      alert(`Prescription and diagnosis saved successfully for ${selectedPatient.name}.`);
      setEditModalOpen(false);
      setSelectedPatient(null);
      loadData();
    } catch (err) {
      console.error('PRESCRIPTION ERROR:', err);
      alert(err.message || 'Failed to save prescription');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />

      <div className="dashboard-main">
        <DashboardHeader
          title="Doctor Consultation & Prescriptions"
          toggleSidebar={setSidebarOpen}
        />

        <main className="dashboard-content">
          {/* SEARCH */}
          <div className="doctor-patients-controls">
            <div className="search-bar-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search patient by ID, name, diagnosis, phone, or village..."
                className="form-control search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="empty-state-container">
              <p>Loading patients...</p>
            </div>
          )}

          {/* PATIENT TABLE */}
          {!loading && (
            <div className="table-responsive">
              {filteredPatients.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Patient ID</th>
                      <th>Name</th>
                      <th>Age / Gender</th>
                      <th>Village / Address</th>
                      <th>Diagnosis / Reason</th>
                      <th>Last Visit</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map(patient => {
                      return (
                        <tr key={patient.id}>
                          <td className="font-weight-600">{patient.id}</td>
                          <td className="font-weight-600">
                            {patient.name}
                            {patient.bloodGroup && (
                              <span className="badge badge-info" style={{ marginLeft: '6px', fontSize: '0.7rem' }}>
                                {patient.bloodGroup}
                              </span>
                            )}
                          </td>
                          <td>{patient.age || '-'} yrs / {patient.gender || '-'}</td>
                          <td className="text-secondary font-size-sm">
                            <FaMapMarkerAlt style={{ color: '#0f766e', marginRight: '4px' }} />
                            {patient.address || 'Rural PHC Sector'}
                          </td>
                          <td>
                            <span className="disease-highlight">
                              {patient.disease || 'General Checkup'}
                            </span>
                          </td>
                          <td>{patient.lastVisit || '-'}</td>
                          <td>
                            <div className="table-action-btns">
                              <button
                                className="btn-action btn-view"
                                onClick={() => handleOpenViewModal(patient)}
                                title="View Patient Details"
                              >
                                <FaEye /> View
                              </button>
                              <button
                                className="btn-action btn-edit"
                                onClick={() => handleOpenEditModal(patient)}
                                title="Prescribe Medications"
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
          )}

          {/* =================================================
              VIEW MODAL (Complete matching patient information)
          ================================================= */}
          {viewModalOpen && selectedPatient && (
            <div className="modal-overlay">
              <div className="modal-content doc-rx-modal" style={{ maxWidth: '750px' }}>
                <div className="modal-header">
                  <div>
                    <h3>Patient Clinical Profile: {selectedPatient.name}</h3>
                    <span className="text-muted">
                      Patient ID: {selectedPatient.id} • Registered by Hospital Intake
                    </span>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={() => setViewModalOpen(false)}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="rx-slip-card">
                    <div className="rx-slip-header">
                      <div className="rx-doctor-info">
                        <h4>
                          <FaUserMd /> {selectedPatient.doctor || 'Dr. Sarah Paul'}
                        </h4>
                        <small className="text-muted">Physician in Charge</small>
                      </div>
                      <div className="rx-symbol">℞</div>
                    </div>

                    <div className="patient-details-grid" style={{ marginBottom: '1.25rem' }}>
                      <div className="detail-field">
                        <span className="detail-label">Full Name</span>
                        <span className="detail-val">{selectedPatient.name}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Age & DOB</span>
                        <span className="detail-val">{selectedPatient.dob || 'N/A'} ({selectedPatient.age || '-'} yrs)</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Gender & Blood Group</span>
                        <span className="detail-val">{selectedPatient.gender || '-'} • Blood Group: {selectedPatient.bloodGroup || 'N/A'}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Phone Number</span>
                        <span className="detail-val">{selectedPatient.phone || '-'}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Email Address</span>
                        <span className="detail-val">{selectedPatient.email || 'N/A'}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Village / Address</span>
                        <span className="detail-val">{selectedPatient.address || '-'}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Emergency Contact</span>
                        <span className="detail-val">{selectedPatient.emergencyContact || '-'}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Diagnosis / Condition</span>
                        <span className="detail-val" style={{ color: '#0f766e', fontWeight: 700 }}>
                          {selectedPatient.disease || 'General Checkup'}
                        </span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Last Visit Date</span>
                        <span className="detail-val">{selectedPatient.lastVisit || 'N/A'}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Next Scheduled Visit</span>
                        <span className="detail-val">{selectedPatient.nextVisit || 'None Scheduled'}</span>
                      </div>
                    </div>

                    {/* Prescriptions List */}
                    <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', fontWeight: 700, color: '#0f766e' }}>
                        <FaPills /> <span>Prescribed Medications</span>
                      </div>
                      {selectedPatient.medicines && selectedPatient.medicines.length > 0 ? (
                        <div className="table-responsive" style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <table className="table" style={{ margin: 0, fontSize: '0.88rem' }}>
                            <thead>
                              <tr>
                                <th>Medicine</th>
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
                                  <td className="font-weight-600">{med.name}</td>
                                  <td>{med.dosage || 'Standard'}</td>
                                  <td>{med.frequency || 'As directed'}</td>
                                  <td>{med.duration || 'Course'}</td>
                                  <td>{med.quantity}</td>
                                  <td className="text-secondary">{med.instructions || 'Take as prescribed'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                          No medications prescribed yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setViewModalOpen(false);
                      handleOpenEditModal(selectedPatient);
                    }}
                    style={{ marginRight: 'auto' }}
                  >
                    <FaFilePrescription /> Prescribe / Edit Diagnosis
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => window.print()}
                  >
                    <FaPrint /> Print Summary
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setViewModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              PRESCRIPTION MODAL
          ================================================= */}
          {editModalOpen && selectedPatient && (
            <div className="modal-overlay">
              <div
                className="modal-content doc-prescribe-modal"
                style={{ maxWidth: '850px' }}
              >
                <div className="modal-header">
                  <div>
                    <h3>Prescribe Medications & Diagnosis</h3>
                    <span className="text-muted">
                      {selectedPatient.name} • ID: {selectedPatient.id}
                    </span>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={() => setEditModalOpen(false)}
                  >
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handlePrescriptionSubmit}>
                  <div
                    className="modal-body"
                    style={{
                      maxHeight: '75vh',
                      overflowY: 'auto'
                    }}
                  >
                    {/* DIAGNOSIS */}
                    <div className="form-row">
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="doc-disease">Clinical Diagnosis *</label>
                        <input
                          type="text"
                          id="doc-disease"
                          className="form-control"
                          placeholder="e.g. Type 2 Diabetes / Malaria"
                          value={editForm.disease}
                          onChange={(e) =>
                            setEditForm(prev => ({
                              ...prev,
                              disease: e.target.value
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="doc-symptoms">Symptoms / Observed Vitals</label>
                        <input
                          type="text"
                          id="doc-symptoms"
                          className="form-control"
                          placeholder="e.g. Fever, body ache, elevated BP"
                          value={editForm.symptoms}
                          onChange={(e) =>
                            setEditForm(prev => ({
                              ...prev,
                              symptoms: e.target.value
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* MEDICINES */}
                    <div className="rx-builder-section">
                      <div className="rx-builder-header">
                        <div>
                          <h4 className="rx-builder-title">
                            <FaPrescriptionBottleAlt /> Prescribed Medicines ({prescribedMeds.length})
                          </h4>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={handleAddMedicineRow}
                        >
                          <FaPlus /> Add Medicine
                        </button>
                      </div>

                      {/* MEDICINE ROWS */}
                      <div className="rx-med-cards-container">
                        {prescribedMeds.map((med, index) => (
                          <div key={med.id} className="rx-med-card">
                            <div className="rx-med-card-header">
                              <span className="rx-med-number">Medicine #{index + 1}</span>
                              <button
                                type="button"
                                className="btn-delete-med"
                                onClick={() => handleRemoveMedicineRow(index)}
                              >
                                <FaTrash /> Remove
                              </button>
                            </div>

                            <div className="rx-med-card-grid">
                              {/* MEDICINE SELECT */}
                              <div className="form-group med-name-field">
                                <label>Medicine Name *</label>
                                <select
                                  className="form-control"
                                  value={med.medicineId || med.name}
                                  onChange={(e) => handleMedicineSelect(index, e.target.value)}
                                  required
                                >
                                  <option value="">-- Choose Medicine from Stock --</option>
                                  {pharmacyStock.map(medicine => (
                                    <option key={medicine.id} value={medicine.id}>
                                      {medicine.name} ({medicine.category}) — Stock: {medicine.quantity}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* DOSAGE */}
                              <div className="form-group">
                                <label>Dosage</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g. 500mg"
                                  value={med.dosage}
                                  onChange={(e) => handleMedFieldChange(index, 'dosage', e.target.value)}
                                />
                              </div>

                              {/* FREQUENCY */}
                              <div className="form-group">
                                <label>Frequency</label>
                                <input
                                  type="text"
                                  list="frequencyOptionsList"
                                  className="form-control"
                                  placeholder="e.g. 1-0-1"
                                  value={med.frequency}
                                  onChange={(e) => handleMedFieldChange(index, 'frequency', e.target.value)}
                                />
                              </div>

                              {/* DURATION */}
                              <div className="form-group">
                                <label>Duration</label>
                                <input
                                  type="text"
                                  list="durationOptionsList"
                                  className="form-control"
                                  placeholder="e.g. 5 days"
                                  value={med.duration}
                                  onChange={(e) => handleMedFieldChange(index, 'duration', e.target.value)}
                                />
                              </div>

                              {/* QUANTITY */}
                              <div className="form-group">
                                <label>Quantity *</label>
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control"
                                  value={med.quantity}
                                  onChange={(e) => handleMedFieldChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                  required
                                />
                              </div>

                              {/* INSTRUCTIONS */}
                              <div className="form-group">
                                <label>Instructions</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g. Take after meal"
                                  value={med.instructions}
                                  onChange={(e) => handleMedFieldChange(index, 'instructions', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CLINICAL NOTES */}
                    <div className="form-group" style={{ marginTop: '1.25rem' }}>
                      <label htmlFor="doc-notes">Clinical Notes & Follow-up Instructions</label>
                      <textarea
                        id="doc-notes"
                        className="form-control"
                        rows="3"
                        placeholder="e.g. Review blood glucose in 14 days. Avoid high sugar diet."
                        value={editForm.clinicalNotes}
                        onChange={(e) =>
                          setEditForm(prev => ({
                            ...prev,
                            clinicalNotes: e.target.value
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <FaFilePrescription /> Issue Prescription
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DATALISTS */}
          <datalist id="frequencyOptionsList">
            {FREQUENCY_OPTIONS.map((freq, i) => (
              <option key={i} value={freq} />
            ))}
          </datalist>

          <datalist id="durationOptionsList">
            {DURATION_OPTIONS.map((dur, i) => (
              <option key={i} value={dur} />
            ))}
          </datalist>
        </main>
      </div>
    </div>
  );
};

export default DoctorPatients;