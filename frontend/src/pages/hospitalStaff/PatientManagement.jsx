import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import {
  getPatients,
  addPatient,
  updatePatient,
  deletePatient
} from '../../services/localStorageService';
import { 
  FaSearch, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrashAlt, 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight,
  FaPills,
  FaUserMd,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaHeartbeat
} from 'react-icons/fa';
import './PatientManagement.css';

const PatientManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filtering and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDisease, setFilterDisease] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    try {
      const data = getPatients() || [];
      setPatients(data);
    } catch (error) {
      console.error("Failed to load patients:", error);
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

  // Form States (Hospital staff registers patient demographics and diagnosis)
  const [patientForm, setPatientForm] = useState({
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
    lastVisit: ''
  });

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
    id = id.replace(/^edit-/, '');
    setPatientForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleOpenAddModal = () => {
    const nextNum = patients.length > 0 
      ? Math.max(...patients.map(p => parseInt(String(p.id).replace('P', '')) || 1000)) + 1 
      : 1011;
    
    setPatientForm({
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
      lastVisit: new Date().toISOString().split('T')[0]
    });
    setAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
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
      addPatient(patientForm);
      loadPatients();
      setAddModalOpen(false);
      alert(`Patient ${patientForm.name} registered successfully.`);
    } catch (error) {
      console.error("Failed to add patient:", error);
      alert(`Failed to add patient: ${error.message}`);
    }
  };

  const handleOpenEditModal = (patient) => {
    setSelectedPatient(patient);
    setPatientForm({
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
      lastVisit: patient.lastVisit || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
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
      updatePatient(patientForm);
      loadPatients();
      setEditModalOpen(false);
      setSelectedPatient(null);
      alert('Patient record updated successfully.');
    } catch (error) {
      console.error("Failed to update patient:", error);
      alert(`Failed to update patient: ${error.message}`);
    }
  };

  const handleOpenDeleteModal = (patient) => {
    setSelectedPatient(patient);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedPatient) return;

    try {
      deletePatient(selectedPatient.id);
      loadPatients();
      setDeleteModalOpen(false);
      setSelectedPatient(null);
      alert('Patient record removed successfully.');
    } catch (error) {
      console.error("Failed to delete patient:", error);
      alert(`Failed to delete patient: ${error.message}`);
    }
  };

  // Get distinct list of diseases for filtering dropdown
  const uniqueDiseases = [...new Set(patients.map(p => p.disease).filter(Boolean))];

  const activePatients = patients.filter(patient => !(patient.status === 'Prescribed' || patient.prescribed === true));

  // Filtering Logic (Status filter removed per requirement 5)
  const filteredPatients = activePatients.filter(patient => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (patient.name && patient.name.toLowerCase().includes(query)) ||
      (patient.id && String(patient.id).toLowerCase().includes(query)) ||
      (patient.phone && String(patient.phone).includes(query)) ||
      (patient.address && patient.address.toLowerCase().includes(query));

    const matchesDisease = filterDisease ? patient.disease === filterDisease : true;
    const matchesGender = filterGender ? patient.gender === filterGender : true;

    return matchesSearch && matchesDisease && matchesGender;
  });

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPatients.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredPatients.length / recordsPerPage) || 1;

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
                  placeholder="Search by ID, name, phone, or village..."
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
                <strong>Hospital Staff Protocol:</strong> Staff registers patient demographics and admitting diagnosis. 
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
                    <th>Village / Address</th>
                    <th>Phone</th>
                    <th>Diagnosis / Reason</th>
                    <th>Assigned Doctor</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map(patient => {
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
                        <td>{patient.age} yrs / {patient.gender}</td>
                        <td className="text-secondary font-size-sm">
                          <FaMapMarkerAlt style={{ color: '#0f766e', marginRight: '4px' }} />
                          {patient.address || 'Rural PHC Sector'}
                        </td>
                        <td>{patient.phone}</td>
                        <td>
                          <span className="diagnosis-pill">{patient.disease || 'General Checkup'}</span>
                        </td>
                        <td>
                          <span className="doctor-badge"><FaUserMd /> {patient.doctor}</span>
                        </td>
                        <td>
                          <div className="table-action-btns">
                            <button 
                              className="btn-action btn-view" 
                              onClick={() => { setSelectedPatient(patient); setViewModalOpen(true); }}
                              title="View Details"
                            >
                              <FaEye /> View
                            </button>
                            <button 
                              className="btn-action btn-edit" 
                              onClick={() => handleOpenEditModal(patient)}
                              title="Edit Details"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button 
                              className="btn-action btn-delete" 
                              onClick={() => handleOpenDeleteModal(patient)}
                              title="Delete Patient"
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
                <p>No matching patient records found.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <span className="pagination-info">
                Showing {indexOfFirstRecord + 1} - {Math.min(indexOfLastRecord, filteredPatients.length)} of {filteredPatients.length} Patients
              </span>
              <div className="pagination-controls">
                <button 
                  className="page-btn" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page} 
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className="page-btn" 
                  onClick={() => setCurrentPage(prev => Math.max(prev + 1, 1))}
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* VIEW PATIENT DETAILS MODAL */}
          {viewModalOpen && selectedPatient && (
            <div className="modal-overlay">
              <div className="modal-content modal-lg">
                <div className="modal-header">
                  <h3>Patient Profile: {selectedPatient.name}</h3>
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
                      <span className="detail-label">Date of Birth & Age</span>
                      <span className="detail-val">{selectedPatient.dob || 'N/A'} ({selectedPatient.age} yrs)</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Gender & Blood Group</span>
                      <span className="detail-val">{selectedPatient.gender} • Blood Group: {selectedPatient.bloodGroup || 'N/A'}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Phone Number</span>
                      <span className="detail-val">{selectedPatient.phone}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Email Address</span>
                      <span className="detail-val">{selectedPatient.email || 'N/A'}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Village / Full Address</span>
                      <span className="detail-val">{selectedPatient.address}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Emergency Contact</span>
                      <span className="detail-val">{selectedPatient.emergencyContact}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Diagnosis / Reason</span>
                      <span className="detail-val" style={{ color: '#0f766e' }}>{selectedPatient.disease}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Assigned Doctor</span>
                      <span className="detail-val">{selectedPatient.doctor}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-label">Last Visit Date</span>
                      <span className="detail-val">{selectedPatient.lastVisit || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Doctor Prescribed Medications Overview */}
                  <div className="doctor-prescriptions-box" style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
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
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setViewModalOpen(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* REGISTER NEW PATIENT MODAL */}
          {addModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content modal-lg">
                <div className="modal-header">
                  <h3><FaPlus className="text-primary" /> Register New Patient</h3>
                  <button className="modal-close-btn" onClick={() => setAddModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-body">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="id">Patient ID</label>
                        <input type="text" id="id" className="form-control" value={patientForm.id} disabled />
                      </div>
                      <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input 
                          type="text" 
                          id="name" 
                          className="form-control" 
                          placeholder="e.g. Ramesh Kumar" 
                          value={patientForm.name} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="dob">Date of Birth *</label>
                        <input 
                          type="date" 
                          id="dob" 
                          className="form-control" 
                          value={patientForm.dob} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="age">Calculated Age</label>
                        <input type="number" id="age" className="form-control" value={patientForm.age} disabled />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="gender">Gender *</label>
                        <select id="gender" className="form-control" value={patientForm.gender} onChange={handleInputChange}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="bloodGroup">Blood Group</label>
                        <select id="bloodGroup" className="form-control" value={patientForm.bloodGroup} onChange={handleInputChange}>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          className="form-control" 
                          placeholder="e.g. 9812345670" 
                          value={patientForm.phone} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                          type="email" 
                          id="email" 
                          className="form-control" 
                          placeholder="e.g. patient@email.com" 
                          value={patientForm.email} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="address">Village / Residential Address *</label>
                        <input 
                          type="text" 
                          id="address" 
                          className="form-control" 
                          placeholder="e.g. Village Rampur, Ward 4, Bihar" 
                          value={patientForm.address} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="emergencyContact">Emergency Contact *</label>
                        <input 
                          type="text" 
                          id="emergencyContact" 
                          className="form-control" 
                          placeholder="e.g. Sita Devi - 9812345671" 
                          value={patientForm.emergencyContact} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="disease">Admitting Diagnosis / Chief Complaint *</label>
                        <input 
                          type="text" 
                          id="disease" 
                          className="form-control" 
                          placeholder="e.g. Acute Viral Fever & Cough" 
                          value={patientForm.disease} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="doctor">Assigned Physician</label>
                        <input 
                          type="text" 
                          id="doctor" 
                          className="form-control" 
                          value={patientForm.doctor} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastVisit">Admit / Visit Date *</label>
                      <input 
                        type="date" 
                        id="lastVisit" 
                        className="form-control" 
                        value={patientForm.lastVisit} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Register Patient</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* EDIT PATIENT MODAL */}
          {editModalOpen && selectedPatient && (
            <div className="modal-overlay">
              <div className="modal-content modal-lg">
                <div className="modal-header">
                  <h3><FaEdit className="text-primary" /> Edit Patient Information: {selectedPatient.name}</h3>
                  <button className="modal-close-btn" onClick={() => setEditModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-body">
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
                        <label htmlFor="edit-dob">Date of Birth</label>
                        <input type="date" id="edit-dob" className="form-control" value={patientForm.dob} onChange={handleInputChange} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-age">Age</label>
                        <input type="number" id="edit-age" className="form-control" value={patientForm.age} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="edit-gender">Gender</label>
                        <select id="edit-gender" className="form-control" value={patientForm.gender} onChange={handleInputChange}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-bloodGroup">Blood Group</label>
                        <select id="edit-bloodGroup" className="form-control" value={patientForm.bloodGroup} onChange={handleInputChange}>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
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
                        <input type="email" id="edit-email" className="form-control" value={patientForm.email} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="edit-address">Village / Residential Address *</label>
                        <input type="text" id="edit-address" className="form-control" value={patientForm.address} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-emergencyContact">Emergency Contact *</label>
                        <input type="text" id="edit-emergencyContact" className="form-control" value={patientForm.emergencyContact} onChange={handleInputChange} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="edit-disease">Admitting Diagnosis / Condition</label>
                        <input type="text" id="edit-disease" className="form-control" value={patientForm.disease} onChange={handleInputChange} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-doctor">Assigned Doctor</label>
                        <input type="text" id="edit-doctor" className="form-control" value={patientForm.doctor} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-lastVisit">Last Visit Date</label>
                      <input type="date" id="edit-lastVisit" className="form-control" value={patientForm.lastVisit} onChange={handleInputChange} />
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
              <div className="modal-content modal-sm">
                <div className="modal-header">
                  <h3>Delete Patient Record</h3>
                  <button className="modal-close-btn" onClick={() => setDeleteModalOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to permanently delete patient <strong>{selectedPatient.name}</strong> ({selectedPatient.id})?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                  <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
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
