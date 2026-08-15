import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';

import { getPatients, updatePatient } from '../../services/api/patientService';
import {
  getMedicines
} from '../../services/api/medicineService';
import { prescribeMultiple } from '../../services/api/prescriptionService';
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPatient, setSelectedPatient] = useState(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    id: '',
    disease: '',
    symptoms: '',
    status: 'Active',
    clinicalNotes: ''
  });

  const [prescribedMeds, setPrescribedMeds] = useState([]);

  // =====================================================
  // LOAD PATIENTS + MEDICINES
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [patientsData, medicinesData] = await Promise.all([
        getPatients(),
        getMedicines()
      ]);

      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setPharmacyStock(Array.isArray(medicinesData) ? medicinesData : []);

    } catch (err) {

      console.error('LOAD DATA ERROR:', err);

      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'Unable to load patients and medicines'
      );

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

    const name = String(patient.Patient_Name || '').toLowerCase();
    const id = String(patient.Patient_ID || '').toLowerCase();
    const village = String(patient.Village || '').toLowerCase();
    const disease = String(patient.Disease || '').toLowerCase();

    const query = searchQuery.toLowerCase();

    return (
      name.includes(query) ||
      id.includes(query) ||
      village.includes(query) ||
      disease.includes(query)
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
      id: patient.Patient_ID,
      disease: patient.Disease || '',
      symptoms: patient.Symptoms || '',
      status: patient.Status || 'Active',
      clinicalNotes: ''
    });

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

    setPrescribedMeds(prev =>
      prev.filter((_, i) => i !== index)
    );
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

  const handleMedicineSelect = (index, medicineId) => {

    const medicine = pharmacyStock.find(
      m => String(m.Medicine_ID) === String(medicineId)
    );

    setPrescribedMeds(prev => {

      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        medicineId: medicineId,
        name: medicine?.Medicine_Name || ''
      };

      return updated;
    });
  };

  // =====================================================
  // DIAGNOSIS UPDATE
  // =====================================================

  const handleDiagnosis = async () => {

    if (!selectedPatient) return;

    try {

      await updatePatient(
        selectedPatient.Patient_ID,
        {
          Disease: editForm.disease,
          Symptoms: editForm.symptoms
        }
      );

      alert('Patient diagnosis updated successfully.');

      await loadData();

    } catch (err) {

      console.error(err);

      alert(
        err?.response?.data?.detail ||
        'Failed to update diagnosis'
      );
    }
  };

  // =====================================================
  // PRESCRIPTION SUBMIT
  // =====================================================

  const handlePrescriptionSubmit = async (e) => {

    e.preventDefault();

    if (!editForm.disease.trim()) {

      alert('Please enter the diagnosed disease.');

      return;
    }

    const validMeds = prescribedMeds.filter(
      med => med.medicineId && Number(med.quantity) > 0
    );

    if (validMeds.length === 0) {

      alert('Please select at least one medicine.');

      return;
    }

    try {

      // -------------------------------------------------
      // FIRST UPDATE DIAGNOSIS
      // -------------------------------------------------

      await updatePatient(
        editForm.id,
        {
          Disease: editForm.disease,
          Symptoms: editForm.symptoms
        }
      );

      // -------------------------------------------------
      // PRESCRIBE EACH MEDICINE (via prescriptionService)
      // -------------------------------------------------

      const medsPayload = validMeds.map(m => ({ medicine_id: Number(m.medicineId), quantity: Number(m.quantity) }));

      // call sequentially for each medicine (backend supports single-item POST)
      for (const item of medsPayload) {
        await prescribeMultiple({ patient_id: Number(editForm.id), medicines: [item], user_id: null });
      }

      alert(
        `Prescription saved successfully for ${selectedPatient.Patient_Name}.`
      );

      setEditModalOpen(false);
      setSelectedPatient(null);

      await loadData();

    } catch (err) {

      console.error('PRESCRIPTION ERROR:', err);

      alert(
        err?.response?.data?.detail?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to save prescription'
      );
    }
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusBadgeClass = (status) => {

    switch (status) {

      case 'Critical':
        return 'badge badge-danger';

      case 'Active':
        return 'badge badge-warning';

      case 'Under Observation':
        return 'badge badge-info';

      case 'Recovered':
        return 'badge badge-success';

      default:
        return 'badge badge-primary';
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="dashboard-layout">

      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={setSidebarOpen}
      />

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
                placeholder="Search patient by ID, name, diagnosis or village..."
                className="form-control search-input"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
              />

            </div>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="empty-state-container">
              <p>Loading patients...</p>
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="empty-state-container">
              <p>{error}</p>

              <button
                className="btn btn-primary"
                onClick={loadData}
              >
                Retry
              </button>
            </div>
          )}

          {/* PATIENT TABLE */}

          {!loading && !error && (

            <div className="table-responsive">

              {filteredPatients.length > 0 ? (

                <table className="table">

                  <thead>

                    <tr>
                      <th>Patient ID</th>
                      <th>Name</th>
                      <th>Age / Gender</th>
                      <th>Village</th>
                      <th>Diagnosis</th>
                      <th>Last Visit</th>
                      <th>Action</th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredPatients.map(patient => (

                      <tr key={patient.Patient_ID}>

                        <td className="font-weight-600">
                          {patient.Patient_ID}
                        </td>

                        <td className="font-weight-600">
                          {patient.Patient_Name}
                        </td>

                        <td>
                          {patient.Age || '-'} yrs /
                          {' '}
                          {patient.Gender || '-'}
                        </td>

                        <td>
                          {patient.Village || '-'}
                        </td>

                        <td>
                          <span className="disease-highlight">
                            {patient.Disease || 'Not Diagnosed'}
                          </span>
                        </td>

                        <td>
                          {patient.Visit_Date || '-'}
                        </td>

                        <td>

                          <div className="table-action-btns">

                            <button
                              className="btn-action btn-view"
                              onClick={() =>
                                handleOpenViewModal(patient)
                              }
                            >
                              <FaEye /> View
                            </button>

                            <button
                              className="btn-action btn-edit"
                              onClick={() =>
                                handleOpenEditModal(patient)
                              }
                            >
                              <FaFilePrescription /> Prescribe
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

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
              VIEW MODAL
          ================================================= */}

          {viewModalOpen && selectedPatient && (

            <div className="modal-overlay">

              <div className="modal-content doc-rx-modal">

                <div className="modal-header">

                  <div>

                    <h3>
                      Patient Clinical Summary
                    </h3>

                    <span className="text-muted">
                      Patient ID: {selectedPatient.Patient_ID}
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
                          <FaUserMd />
                          {' '}
                          {selectedPatient.Doctor || 'Doctor'}
                        </h4>

                      </div>

                      <div className="rx-symbol">
                        ℞
                      </div>

                    </div>

                    <div className="rx-patient-meta-grid">

                      <div>
                        <strong>Patient:</strong>{' '}
                        {selectedPatient.Patient_Name}
                      </div>

                      <div>
                        <strong>Age:</strong>{' '}
                        {selectedPatient.Age || '-'}
                      </div>

                      <div>
                        <strong>Gender:</strong>{' '}
                        {selectedPatient.Gender || '-'}
                      </div>

                      <div>
                        <strong>Village:</strong>{' '}
                        {selectedPatient.Village || '-'}
                      </div>

                      <div>
                        <strong>Diagnosis:</strong>{' '}
                        <span className="text-primary">
                          {selectedPatient.Disease || 'Not diagnosed'}
                        </span>
                      </div>

                      <div>
                        <strong>Symptoms:</strong>{' '}
                        {selectedPatient.Symptoms || '-'}
                      </div>

                    </div>

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    className="btn btn-outline-primary"
                    onClick={() => window.print()}
                  >
                    <FaPrint /> Print
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setViewModalOpen(false)
                    }
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

                    <h3>
                      Prescribe Medications
                    </h3>

                    <span className="text-muted">
                      {selectedPatient.Patient_Name}
                      {' • '}
                      ID: {selectedPatient.Patient_ID}
                    </span>

                  </div>

                  <button
                    className="modal-close-btn"
                    onClick={() =>
                      setEditModalOpen(false)
                    }
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

                      <div
                        className="form-group"
                        style={{ flex: 1 }}
                      >

                        <label>
                          Clinical Diagnosis *
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Dengue"
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

                      <div
                        className="form-group"
                        style={{ flex: 1 }}
                      >

                        <label>
                          Symptoms
                        </label>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Fever, headache"
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

                            <FaPrescriptionBottleAlt />

                            {' '}
                            Prescription
                            ({prescribedMeds.length})

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

                          <div
                            key={med.id}
                            className="rx-med-card"
                          >

                            <div className="rx-med-card-header">

                              <span className="rx-med-number">
                                Medicine #{index + 1}
                              </span>

                              <button
                                type="button"
                                className="btn-delete-med"
                                onClick={() =>
                                  handleRemoveMedicineRow(index)
                                }
                              >
                                <FaTrash /> Remove
                              </button>

                            </div>

                            <div className="rx-med-card-grid">

                              {/* MEDICINE */}

                              <div
                                className="form-group med-name-field"
                              >

                                <label>
                                  Medicine *
                                </label>

                                <select
                                  className="form-control"
                                  value={med.medicineId}
                                  onChange={(e) =>
                                    handleMedicineSelect(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  required
                                >

                                  <option value="">
                                    Select medicine
                                  </option>

                                  {pharmacyStock.map(medicine => (

                                    <option
                                      key={medicine.Medicine_ID}
                                      value={medicine.Medicine_ID}
                                    >
                                      {medicine.Medicine_Name}
                                      {' '}
                                      —
                                      {' '}
                                      Stock:
                                      {' '}
                                      {medicine.Current_Stock}
                                    </option>

                                  ))}

                                </select>

                              </div>

                              {/* DOSAGE */}

                              <div className="form-group">

                                <label>
                                  Dosage
                                </label>

                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="500mg"
                                  value={med.dosage}
                                  onChange={(e) =>
                                    handleMedFieldChange(
                                      index,
                                      'dosage',
                                      e.target.value
                                    )
                                  }
                                />

                              </div>

                              {/* FREQUENCY */}

                              <div className="form-group">

                                <label>
                                  Frequency
                                </label>

                                <input
                                  type="text"
                                  list="frequencyOptionsList"
                                  className="form-control"
                                  placeholder="1-0-1"
                                  value={med.frequency}
                                  onChange={(e) =>
                                    handleMedFieldChange(
                                      index,
                                      'frequency',
                                      e.target.value
                                    )
                                  }
                                />

                              </div>

                              {/* DURATION */}

                              <div className="form-group">

                                <label>
                                  Duration
                                </label>

                                <input
                                  type="text"
                                  list="durationOptionsList"
                                  className="form-control"
                                  placeholder="5 days"
                                  value={med.duration}
                                  onChange={(e) =>
                                    handleMedFieldChange(
                                      index,
                                      'duration',
                                      e.target.value
                                    )
                                  }
                                />

                              </div>

                              {/* QUANTITY */}

                              <div className="form-group">

                                <label>
                                  Quantity *
                                </label>

                                <input
                                  type="number"
                                  min="1"
                                  className="form-control"
                                  value={med.quantity}
                                  onChange={(e) =>
                                    handleMedFieldChange(
                                      index,
                                      'quantity',
                                      e.target.value
                                    )
                                  }
                                  required
                                />

                              </div>

                              {/* INSTRUCTIONS */}

                              <div className="form-group">

                                <label>
                                  Instructions
                                </label>

                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="After meals"
                                  value={med.instructions}
                                  onChange={(e) =>
                                    handleMedFieldChange(
                                      index,
                                      'instructions',
                                      e.target.value
                                    )
                                  }
                                />

                              </div>

                            </div>

                          </div>

                        ))}

                      </div>

                    </div>

                    {/* NOTES */}

                    <div
                      className="form-group"
                      style={{ marginTop: '1.25rem' }}
                    >

                      <label>
                        Clinical Notes
                      </label>

                      <textarea
                        className="form-control"
                        rows="3"
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
                      onClick={() =>
                        setEditModalOpen(false)
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      <FaFilePrescription />
                      {' '}
                      Issue Prescription
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