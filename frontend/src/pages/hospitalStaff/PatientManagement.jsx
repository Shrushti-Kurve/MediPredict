import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import {
  getPatients,
  addPatient,
  updatePatient,
  deletePatient
} from '../../services/api/patientService';
import { 
  FaSearch, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrashAlt, 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight,
  FaLock,
  FaPills,
  FaUserMd,
  FaInfoCircle
} from 'react-icons/fa';
import './PatientManagement.css';

const PatientManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filtering and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDisease, setFilterDisease] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await getPatients();
      // Map backend patient fields to frontend shape
      const mapped = Array.isArray(data) ? data.map(p => ({
        id: p.Patient_ID ? `P${p.Patient_ID}` : (p.id || ''),
        Patient_ID: p.Patient_ID || p.id,
        name: p.Patient_Name || p.name || '',
        age: p.Age || p.age || '',
        gender: p.Gender || p.gender || 'Male',
        address: p.Village || p.address || '',
        phone: p.Phone || p.phone || '',
        email: p.Email || p.email || '',
        emergencyContact: p.EmergencyContact || p.emergencyContact || '',
        disease: p.Disease || p.disease || '',
        doctor: p.Doctor || p.doctor || 'Dr. Sarah Paul',
        lastVisit: p.Visit_Date ? (new Date(p.Visit_Date).toISOString().split('T')[0]) : (p.lastVisit || ''),
        nextVisit: p.Next_Visit || p.nextVisit || '',
        status: p.Status || p.status || 'Active',
        medicines: p.medicines || []
      })) : [];

      setPatients(mapped);
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6;

  // Modals State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form States (Hospital staff does not provide medicine fields)
  const [patientForm, setPatientForm] = useState({
    Patient_ID: '',
    id: '',
    name: '',
    dob: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    disease: '',
    doctor: 'Dr. Sarah Paul',
    lastVisit: '',
    nextVisit: '',
    status: 'Active'
  });

 

  // useEffect(() => {
  //   loadPatients();
  // }, []);

  // Set patient age automatically if date of birth is selected
  useEffect(() => {
    if (patientForm.dob) {
      const birthDate = new Date(patientForm.dob);
      const difference = Date.now() - birthDate.getTime();
      const ageDate = new Date(difference);
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (!isNaN(calculatedAge)) {
        setPatientForm(prev => ({ ...prev, age: calculatedAge }));
      }
    }
  }, [patientForm.dob]);

  // Form Handling
  const handleInputChange = (e) => {
    let { id, value } = e.target;
    // Normalize edit form ids that use edit- prefix
    id = id.replace(/^edit-/, '');
    setPatientForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleOpenAddModal = () => {
    const nextNum = patients.length > 0 
      ? Math.max(...patients.map(p => parseInt(p.id.replace('P', '')) || 1000)) + 1 
      : 1011;
    
    setPatientForm({
      Patient_ID: undefined,
      id: `P${nextNum}`,
      name: '',
      dob: '',
      age: '',
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      disease: '',
      doctor: 'Dr. Sarah Paul',
      lastVisit: new Date().toISOString().split('T')[0],
      nextVisit: '',
      status: 'Active'
    });
    setAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (
      !patientForm.name ||
      !patientForm.dob ||
      !patientForm.phone ||
      !patientForm.address ||
      !patientForm.emergencyContact ||
      !patientForm.disease
    ) {
      alert('Please fill out all required patient profile fields.');
      return;
    }

    try {
      setLoading(true);

      // Map form to backend expected schema
      const payload = {
        Patient_Name: patientForm.name,
        Age: patientForm.age ? Number(patientForm.age) : undefined,
        Gender: patientForm.gender,
        Village: patientForm.address,
        Visit_Date: patientForm.lastVisit || new Date().toISOString().split('T')[0]
      };

      const resp = await addPatient(payload);

      // resp may include Patient_ID — reload will pick it up

      await loadPatients();

      setAddModalOpen(false);

      alert('Patient record registered successfully.');
    } catch (error) {
      console.error("Failed to add patient:", error);
      alert(`Failed to add patient: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (patient) => {
    setSelectedPatient(patient);
    setPatientForm({
      Patient_ID: patient.Patient_ID || undefined,
      id: patient.id,
      name: patient.name,
      dob: patient.dob || '',
      age: patient.age || '',
      gender: patient.gender || 'Male',
      bloodGroup: patient.bloodGroup || 'O+',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
      disease: patient.disease || '',
      doctor: patient.doctor || 'Dr. Sarah Paul',
      lastVisit: patient.lastVisit || '',
      nextVisit: patient.nextVisit || '',
      status: patient.status || 'Active'
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
  e.preventDefault();

  if (
    !patientForm.name ||
    !patientForm.dob ||
    !patientForm.phone ||
    !patientForm.address ||
    !patientForm.emergencyContact
  ) {
    alert('Please fill out all required details.');
    return;
  }

  try {
    setLoading(true);

    const targetId = patientForm.Patient_ID || parseInt((patientForm.id || '').replace('P',''));
    await updatePatient(targetId, patientForm);

    await loadPatients();

    setEditModalOpen(false);
    setSelectedPatient(null);

    alert('Patient record updated successfully.');
  } catch (error) {
    console.error("Failed to update patient:", error);
    alert(`Failed to update patient: ${error.message}`);
  } finally {
    setLoading(false);
  }
};



const handleOpenDeleteModal = (patient) => {
  setSelectedPatient(patient);
  setDeleteModalOpen(true);
};


  const handleDeleteConfirm = async () => {
  if (!selectedPatient) return;

  try {
    setLoading(true);

    const targetId = selectedPatient.Patient_ID || parseInt((selectedPatient.id || '').replace('P',''));
    await deletePatient(targetId);

    await loadPatients();

    setDeleteModalOpen(false);
    setSelectedPatient(null);

    alert('Patient record removed successfully.');
  } catch (error) {
    console.error("Failed to delete patient:", error);
    alert(`Failed to delete patient: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  // Get distinct list of diseases for filtering dropdown
  const uniqueDiseases = [...new Set(patients.map(p => p.disease).filter(Boolean))];

  // Filtering Logic
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery);

    const matchesDisease = filterDisease ? patient.disease === filterDisease : true;
    const matchesGender = filterGender ? patient.gender === filterGender : true;
    const matchesStatus = filterStatus ? patient.status === filterStatus : true;

    return matchesSearch && matchesDisease && matchesGender && matchesStatus;
  });

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPatients.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredPatients.length / recordsPerPage);

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
        <DashboardHeader title="Patient Management & Intake" toggleSidebar={setSidebarOpen} />
        
        <main className="dashboard-content">
          {/* Header Controls */}
          <div className="pm-controls-bar">
            <div className="pm-search-filter-section">
              <div className="search-bar-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by ID, name, or phone..."
                  className="form-control search-input"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>

              <div className="filters-row">
                <select 
                  className="form-control filter-select" 
                  value={filterDisease} 
                  onChange={(e) => { setFilterDisease(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Diagnoses</option>
                  {uniqueDiseases.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select 
                  className="form-control filter-select" 
                  value={filterGender} 
                  onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <select 
                  className="form-control filter-select" 
                  value={filterStatus} 
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Under Observation">Under Observation</option>
                  <option value="Recovered">Recovered</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary add-patient-btn" onClick={handleOpenAddModal}>
              <FaPlus /> Register New Patient
            </button>
          </div>

          {/* Role Permission Badge Notification */}
          <div className="staff-permission-banner">
            <div className="permission-info">
              <FaInfoCircle className="permission-icon" />
              <span>
                <strong>Hospital Staff Protocol:</strong> Staff registers patient demographics, admitting diagnosis, and schedules visits. 
                Prescription medications are exclusively prescribed and modified by licensed Doctors.
              </span>
            </div>
          </div>

          {/* Directory Table */}
          <div className="table-responsive">
            {currentRecords.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age / Gender</th>
                    <th>Phone</th>
                    <th>Diagnosis / Reason</th>
                    <th>Assigned Doctor</th>
                    <th>Prescribed Meds (Dr.)</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map(patient => {
                    const medCount = patient.medicines?.length || 0;
                    return (
                      <tr key={patient.id}>
                        <td className="font-weight-600">{patient.id}</td>
                        <td className="font-weight-600">{patient.name}</td>
                        <td>{patient.age} yrs / {patient.gender}</td>
                        <td>{patient.phone}</td>
                        <td>
                          <span className="diagnosis-pill">{patient.disease || 'General Checkup'}</span>
                        </td>
                        <td>
                          <span className="doctor-badge"><FaUserMd /> {patient.doctor}</span>
                        </td>
                        <td>
                          {medCount > 0 ? (
                            <div className="med-summary-cell" title={patient.medicines.map(m => `${m.name} (${m.dosage || ''})`).join(', ')}>
                              <span className="med-count-badge">
                                <FaPills /> {medCount} Med{medCount > 1 ? 's' : ''}
                              </span>
                              <span className="med-preview-text">
                                {patient.medicines.map(m => m.name).slice(0, 2).join(', ')}{medCount > 2 ? '...' : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted font-size-sm">Pending Dr. Prescription</span>
                          )}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(patient.status)}>
                            {patient.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-action-btns">
                            <button 
                              className="btn-action btn-view" 
                              onClick={() => { setSelectedPatient(patient); setViewModalOpen(true); }}
                              title="View Record Details"
                            >
                              <FaEye /> View
                            </button>
                            <button 
                              className="btn-action btn-edit" 
                              onClick={() => handleOpenEditModal(patient)}
                              title="Modify Demographics & Visit Info"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button 
                              className="btn-action btn-delete-action" 
                              onClick={() => handleOpenDeleteModal(patient)}
                              title="Remove Patient"
                            >
                              <FaTrashAlt /> Delete
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
                <p>No patients matching criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <span className="pagination-info">
                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredPatients.length)} of {filteredPatients.length} patients
              </span>
              <div className="pagination-buttons">
                <button 
                  className="pagination-btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  aria-label="Previous Page"
                >
                  <FaChevronLeft />
                </button>
                <span className="current-page-num">{currentPage} / {totalPages}</span>
                <button 
                  className="pagination-btn" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  aria-label="Next Page"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* VIEW DETAILS MODAL */}
          {viewModalOpen && selectedPatient && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '680px' }}>
                <div className="modal-header">
                  <h3>Patient Intake & Medical Summary: {selectedPatient.name}</h3>
                  <button className="modal-close-btn" onClick={() => setViewModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="patient-details-grid">
                    <div className="detail-field">
                      <span className="detail-label">Patient ID</span>
                      <span className="detail-val">{selectedPatient.id}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-val">{selectedPatient.name}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Age / Gender</span>
                      <span className="detail-val">{selectedPatient.age} yrs / {selectedPatient.gender}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Blood Group</span>
                      <span className="detail-val">{selectedPatient.bloodGroup}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Phone Number</span>
                      <span className="detail-val">{selectedPatient.phone}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Email Address</span>
                      <span className="detail-val">{selectedPatient.email || 'N/A'}</span>
                    </div>
                    <div className="detail-field full-row">
                      <span className="detail-label">Residential Address</span>
                      <span className="detail-val">{selectedPatient.address}</span>
                    </div>
                    <div className="detail-field full-row">
                      <span className="detail-label">Emergency Contact</span>
                      <span className="detail-val">{selectedPatient.emergencyContact}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Assigned Diagnosis</span>
                      <span className="detail-val highlight-val">{selectedPatient.disease || 'N/A'}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Assigned Doctor</span>
                      <span className="detail-val">{selectedPatient.doctor}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Visits</span>
                      <span className="detail-val">Last: {selectedPatient.lastVisit} | Next: {selectedPatient.nextVisit || 'N/A'}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Clinical Status</span>
                      <span className="detail-val">
                        <span className={getStatusBadgeClass(selectedPatient.status)}>
                          {selectedPatient.status}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Doctor Prescriptions Breakdown Card */}
                  <div className="staff-view-prescriptions-section">
                    <div className="section-subtitle">
                      <FaPills className="text-primary" /> Doctor Prescribed Medicines (Read-Only)
                    </div>
                    {selectedPatient.medicines && selectedPatient.medicines.length > 0 ? (
                      <div className="prescriptions-table-container">
                        <table className="staff-prescriptions-table">
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
                                <td className="font-weight-600 text-primary">{med.name}</td>
                                <td>{med.dosage || 'Standard'}</td>
                                <td>{med.frequency || 'As directed'}</td>
                                <td>{med.duration || '-'}</td>
                                <td><span className="qty-tag">{med.quantity}</span></td>
                                <td className="text-muted font-size-sm">{med.instructions || 'Take as directed'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="no-prescriptions-box">
                        <FaInfoCircle /> No medications prescribed yet. Doctor will prescribe medicines during patient consultation.
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setViewModalOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* ADD PATIENT MODAL (No Medicine Rights for Staff) */}
          {addModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '640px' }}>
                <div className="modal-header">
                  <h3>Register New Patient Intake</h3>
                  <button className="modal-close-btn" onClick={() => setAddModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-body">
                    <div className="read-only-section-title">Demographics & Profile</div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="id">Patient ID</label>
                        <input type="text" id="id" className="form-control" value={patientForm.id} disabled />
                      </div>
                      <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input type="text" id="name" className="form-control" placeholder="e.g. Ramesh Kumar" value={patientForm.name} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="dob">Date of Birth *</label>
                        <input type="date" id="dob" className="form-control" value={patientForm.dob} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="age">Age</label>
                        <input type="number" id="age" className="form-control" value={patientForm.age} onChange={handleInputChange} disabled />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="gender">Gender *</label>
                        <select id="gender" className="form-control" value={patientForm.gender} onChange={handleInputChange} required>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="bloodGroup">Blood Group *</label>
                        <select id="bloodGroup" className="form-control" value={patientForm.bloodGroup} onChange={handleInputChange} required>
                          <option value="A+">A+</option>
                          <option value="B+">B+</option>
                          <option value="AB+">AB+</option>
                          <option value="O+">O+</option>
                          <option value="A-">A-</option>
                          <option value="B-">B-</option>
                          <option value="AB-">AB-</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input type="tel" id="phone" className="form-control" placeholder="10-digit phone" value={patientForm.phone} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" className="form-control" placeholder="name@example.com" value={patientForm.email} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">Residential Address *</label>
                      <input type="text" id="address" className="form-control" placeholder="Village / Street, District, State" value={patientForm.address} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="emergencyContact">Emergency Contact *</label>
                      <input type="text" id="emergencyContact" className="form-control" placeholder="Relative Name - Phone Number" value={patientForm.emergencyContact} onChange={handleInputChange} required />
                    </div>

                    <div className="editable-section-title">Clinical Intake & Doctor Assignment</div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="disease">Admitting Disease / Symptoms *</label>
                        <input type="text" id="disease" className="form-control" placeholder="e.g. Hypertension, Fever" value={patientForm.disease} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="doctor">Assigned Doctor *</label>
                        <select id="doctor" className="form-control" value={patientForm.doctor} onChange={handleInputChange} required>
                          <option value="Dr. Sarah Paul">Dr. Sarah Paul (General Medicine)</option>
                          <option value="Dr. Rajesh Gupta">Dr. Rajesh Gupta (Cardiology)</option>
                          <option value="Dr. Anita Desai">Dr. Anita Desai (Pediatrics)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="lastVisit">Registration / Admission Date *</label>
                        <input type="date" id="lastVisit" className="form-control" value={patientForm.lastVisit} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="nextVisit">Next Scheduled Follow-up</label>
                        <input type="date" id="nextVisit" className="form-control" value={patientForm.nextVisit} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="status">Clinical Status *</label>
                      <select id="status" className="form-control" value={patientForm.status} onChange={handleInputChange} required>
                        <option value="Active">Active</option>
                        <option value="Under Observation">Under Observation</option>
                        <option value="Recovered">Recovered</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    {/* Staff Notice: Medicines are restricted to Doctor */}
                    <div className="medicine-restriction-notice">
                      <FaLock className="lock-icon" />
                      <div>
                        <strong>Medication Rights Note:</strong> Prescription medications cannot be added by hospital staff. The assigned Doctor will review and prescribe multiple medicines during consultation.
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Patient Intake</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* EDIT PATIENT MODAL (Demographics & Visit Info - Medicines Read-Only) */}
          {editModalOpen && selectedPatient && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '640px' }}>
                <div className="modal-header">
                  <h3>Edit Patient Record: {selectedPatient.name}</h3>
                  <button className="modal-close-btn" onClick={() => setEditModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-body">
                    <div className="read-only-section-title">Demographics & Profile</div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="edit-id">Patient ID</label>
                        <input type="text" id="edit-id" className="form-control" value={patientForm.id} disabled />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-name">Full Name *</label>
                        <input type="text" id="edit-name" className="form-control" value={patientForm.name} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="edit-dob">Date of Birth *</label>
                        <input type="date" id="edit-dob" className="form-control" value={patientForm.dob} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-age">Age</label>
                        <input type="number" id="edit-age" className="form-control" value={patientForm.age} onChange={handleInputChange} disabled />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="edit-gender">Gender *</label>
                        <select id="edit-gender" className="form-control" value={patientForm.gender} onChange={handleInputChange} required>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-bloodGroup">Blood Group *</label>
                        <select id="edit-bloodGroup" className="form-control" value={patientForm.bloodGroup} onChange={handleInputChange} required>
                          <option value="A+">A+</option>
                          <option value="B+">B+</option>
                          <option value="AB+">AB+</option>
                          <option value="O+">O+</option>
                          <option value="A-">A-</option>
                          <option value="B-">B-</option>
                          <option value="AB-">AB-</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="edit-phone">Phone Number *</label>
                        <input type="tel" id="edit-phone" className="form-control" value={patientForm.phone} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-email">Email Address</label>
                        <input type="email" id="edit-email" className="form-control" value={patientForm.email || ''} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-address">Residential Address *</label>
                      <input type="text" id="edit-address" className="form-control" value={patientForm.address} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-emergencyContact">Emergency Contact *</label>
                      <input type="text" id="edit-emergencyContact" className="form-control" value={patientForm.emergencyContact} onChange={handleInputChange} required />
                    </div>

                    <div className="editable-section-title">Clinical Intake & Schedule</div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="edit-disease">Admitting Diagnosis / Condition *</label>
                        <input type="text" id="edit-disease" className="form-control" value={patientForm.disease} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-doctor">Assigned Doctor *</label>
                        <select id="edit-doctor" className="form-control" value={patientForm.doctor} onChange={handleInputChange} required>
                          <option value="Dr. Sarah Paul">Dr. Sarah Paul (General Medicine)</option>
                          <option value="Dr. Rajesh Gupta">Dr. Rajesh Gupta (Cardiology)</option>
                          <option value="Dr. Anita Desai">Dr. Anita Desai (Pediatrics)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="edit-lastVisit">Last Visit Date *</label>
                        <input type="date" id="edit-lastVisit" className="form-control" value={patientForm.lastVisit} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-nextVisit">Next Scheduled Visit</label>
                        <input type="date" id="edit-nextVisit" className="form-control" value={patientForm.nextVisit || ''} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-status">Clinical Status *</label>
                      <select id="edit-status" className="form-control" value={patientForm.status} onChange={handleInputChange} required>
                        <option value="Active">Active</option>
                        <option value="Under Observation">Under Observation</option>
                        <option value="Recovered">Recovered</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    {/* Prescriptions Read-Only Display in Edit Modal */}
                    <div className="staff-readonly-med-block">
                      <div className="med-block-header">
                        <span className="med-block-title">
                          <FaLock /> Prescriptions Prescribed by Doctor (Read-Only)
                        </span>
                        <span className="text-muted font-size-sm">Staff cannot modify medicines</span>
                      </div>
                      {selectedPatient.medicines && selectedPatient.medicines.length > 0 ? (
                        <div className="med-pills-list">
                          {selectedPatient.medicines.map((m, idx) => (
                            <div key={idx} className="med-pill-item">
                              <FaPills className="text-primary" />
                              <div className="med-pill-details">
                                <span className="med-pill-name">{m.name} ({m.dosage || 'Std'})</span>
                                <span className="med-pill-meta">{m.frequency} • Qty: {m.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-meds-note">No medicines prescribed yet for this patient.</p>
                      )}
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

          {/* DELETE CONFIRMATION MODAL */}
          {deleteModalOpen && selectedPatient && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                  <h3>Delete Patient Record</h3>
                  <button className="modal-close-btn" onClick={() => setDeleteModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this patient record?</p>
                  <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                    {selectedPatient.name} ({selectedPatient.id})
                  </p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientManagement;

