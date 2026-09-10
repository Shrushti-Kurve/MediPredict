import { mockUsers, mockPatients, mockMedicines, mockAlerts } from '../data/mockData';

// Predefined Admin Accounts (Exclusive & Fixed)
export const PREDEFINED_ADMINS = [
  {
    id: "U004",
    name: "System Administrator 1",
    email: "admin1@medipredict.com",
    phone: "9876543213",
    password: "MPAdmin@2026#01",
    role: "admin",
    status: "Active",
    registrationDate: "2026-01-01"
  },
  {
    id: "U005",
    name: "System Administrator 2",
    email: "admin2@medipredict.com",
    phone: "9876543214",
    password: "MPAdmin@2026#02",
    role: "admin",
    status: "Active",
    registrationDate: "2026-01-01"
  }
];

// Initialize data if not present
export const initializeData = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(mockUsers));
  } else {
    try {
      let existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      existingUsers = existingUsers.filter(u => u.email !== 'admin@example.com');
      
      PREDEFINED_ADMINS.forEach(adminAcc => {
        const idx = existingUsers.findIndex(u => u.email.toLowerCase() === adminAcc.email.toLowerCase());
        if (idx !== -1) {
          existingUsers[idx] = { ...existingUsers[idx], ...adminAcc };
        } else {
          existingUsers.push(adminAcc);
        }
      });
      localStorage.setItem('users', JSON.stringify(existingUsers));
    } catch {
      localStorage.setItem('users', JSON.stringify(mockUsers));
    }
  }

  if (!localStorage.getItem('patients')) {
    localStorage.setItem('patients', JSON.stringify(mockPatients));
  }

  if (!localStorage.getItem('medicines')) {
    localStorage.setItem('medicines', JSON.stringify(mockMedicines));
  }

  if (!localStorage.getItem('alerts')) {
    const validInitialAlerts = (mockAlerts || []).filter(shouldIncludeAlert);
    localStorage.setItem('alerts', JSON.stringify(validInitialAlerts));
  }

  pruneExpiredAlerts(30);
  removeDiseaseForecastAlerts();
  pruneMedicineAlertsForInventory();
};

// --- AUTHENTICATION SERVICES ---

export const getLoggedInUser = () => {
  const user = localStorage.getItem('loggedInUser');
  return user ? JSON.parse(user) : null;
};

export const setLoggedInUser = (user) => {
  localStorage.setItem('loggedInUser', JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem('loggedInUser');
};

export const getUsers = () => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const saveUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const updateUserStatus = (userId, status) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].status = status;
    saveUsers(users);
    return users[index];
  }
  return null;
};

export const login = (email, password) => {
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanPassword = password ? password.trim() : '';

  const matchingAdmin = PREDEFINED_ADMINS.find(a => a.email.toLowerCase() === cleanEmail);
  if (matchingAdmin) {
    if (matchingAdmin.password === cleanPassword) {
      setLoggedInUser(matchingAdmin);
      return matchingAdmin;
    }
    return null;
  }

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword);
  
  if (user) {
    if (user.role === 'admin') {
      return null;
    }
    setLoggedInUser(user);
    return user;
  }
  return null;
};

export const signup = (userData) => {
  if (userData.role === 'admin') {
    throw new Error('Admin registration is disabled. Administrator accounts are predefined.');
  }

  const cleanEmail = userData.email ? userData.email.trim().toLowerCase() : '';
  if (PREDEFINED_ADMINS.some(a => a.email.toLowerCase() === cleanEmail)) {
    throw new Error('This email is reserved for system administrators.');
  }

  const users = getUsers();
  const emailExists = users.some(u => u.email.toLowerCase() === cleanEmail);
  if (emailExists) {
    throw new Error('Email is already registered.');
  }
  
  const newId = 'U' + String(users.length + 1).padStart(3, '0');
  const newUser = {
    id: newId,
    status: 'Active',
    registrationDate: new Date().toISOString().split('T')[0],
    ...userData,
    email: cleanEmail
  };
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const updateUser = (updatedData) => {
  const currentUser = getLoggedInUser();
  if (!currentUser) return null;
  
  const users = getUsers();
  const index = users.findIndex(u => u.id === currentUser.id);
  
  if (index !== -1) {
    const updatedUser = { ...users[index], ...updatedData };
    users[index] = updatedUser;
    saveUsers(users);
    setLoggedInUser(updatedUser);
    
    // NOTE: Profile update is a normal system action, NEVER create an alert.
    return updatedUser;
  }
  return null;
};

export const updateUserProfile = (updatedData) => updateUser(updatedData);


// Helper to normalize patient records so medicines array is always valid
export const normalizePatient = (patient) => {
  let medicines = Array.isArray(patient.medicines) ? patient.medicines : [];
  
  if (medicines.length === 0 && patient.medicine && patient.medicine !== 'None' && patient.medicine !== 'Not Prescribed Yet') {
    const medNames = patient.medicine.split(',').map(m => m.trim());
    medicines = medNames.map((name, idx) => ({
      id: `MED-LEGACY-${idx + 1}`,
      name,
      dosage: 'Standard Dosage',
      frequency: 'As directed by physician',
      duration: 'Course duration',
      quantity: Math.max(1, Math.floor((parseInt(patient.medicineQuantity) || 10) / medNames.length)),
      instructions: 'Take as prescribed'
    }));
  }

  const medicineSummary = medicines.length > 0 
    ? medicines.map(m => m.name).join(', ') 
    : (patient.medicine || 'Not Prescribed Yet');

  const totalQuantity = medicines.length > 0
    ? medicines.reduce((sum, m) => sum + (parseInt(m.quantity) || 0), 0)
    : (parseInt(patient.medicineQuantity) || 0);

  const isPrescribed = patient.status === 'Prescribed' || patient.prescribed === true || (medicines.length > 0 && patient.medicine !== 'Not Prescribed Yet' && patient.status !== 'Awaiting Prescription');

  return {
    ...patient,
    medicines,
    medicine: medicineSummary,
    medicineQuantity: totalQuantity,
    prescribed: isPrescribed,
    pendingPrescription: !isPrescribed,
    status: isPrescribed ? 'Prescribed' : (patient.status || 'Awaiting Prescription')
  };
};

// --- PATIENTS SERVICES (Hospital Staff and Doctor) ---

export const getPatients = () => {
  const raw = JSON.parse(localStorage.getItem('patients') || '[]');
  return raw.map(normalizePatient);
};

export const savePatients = (patients) => {
  localStorage.setItem('patients', JSON.stringify(patients.map(normalizePatient)));
};

const normalizeDiseaseKey = (value = '') => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// =========================================================
// REAL DISEASE FORECASTING & ANALYSIS ENGINE
// Triggered ONLY after required real patient prescriptions are completed
// =========================================================

export const removeDiseaseForecastAlerts = () => {
  const alerts = JSON.parse(localStorage.getItem('alerts') || '[]');
  const list = Array.isArray(alerts) ? alerts : [];

  const diseaseAlerts = list.filter((alert) => {
    if (!alert) return false;
    const alertText = `${alert.title || ''} ${alert.description || ''} ${alert.message || ''}`.toLowerCase();
    const categoryText = `${alert.category || alert.Alert_Category || ''}`.toLowerCase();
    return categoryText.includes('disease') || /disease|outbreak|risk|forecast|clinical disease alert|diagnosed with/.test(alertText);
  });

  const nonDiseaseAlerts = list.filter((alert) => {
    if (!alert) return false;
    const alertText = `${alert.title || ''} ${alert.description || ''} ${alert.message || ''}`.toLowerCase();
    const categoryText = `${alert.category || alert.Alert_Category || ''}`.toLowerCase();
    return !(categoryText.includes('disease') || /disease|outbreak|risk|forecast|clinical disease alert|diagnosed with/.test(alertText));
  });

  const newestDiseaseAlerts = diseaseAlerts
    .slice()
    .sort((a, b) => new Date(b.date || b.created_at || Date.now()) - new Date(a.date || a.created_at || Date.now()))
    .slice(0, 2);

  const dedupedDiseaseKeys = new Set();
  const dedupedDiseaseAlerts = newestDiseaseAlerts.filter((alert) => {
    const key = `${(alert.title || '').trim()}::${(alert.message || alert.description || '').trim()}`.toLowerCase();
    if (dedupedDiseaseKeys.has(key)) return false;
    dedupedDiseaseKeys.add(key);
    return true;
  });

  const filteredAlerts = [...nonDiseaseAlerts, ...dedupedDiseaseAlerts];
  if (filteredAlerts.length !== list.length) {
    localStorage.setItem('alerts', JSON.stringify(filteredAlerts));
  }

  return filteredAlerts;
};

const pruneMedicineAlertsForInventory = (medicines = getMedicines()) => {
  const alerts = JSON.parse(localStorage.getItem('alerts') || '[]');
  const activeMessages = new Set();
  const today = new Date().toISOString().split('T')[0];

  (Array.isArray(medicines) ? medicines : []).forEach((med) => {
    const qty = parseInt(med.quantity) || 0;
    const threshold = parseInt(med.minimumStock) || 50;
    const expiryValues = [med.expiryDate, med.newStockExpiryDate, med.expiry].filter(Boolean).map(String);
    const normalizedExpiry = expiryValues
      .map(value => value.trim())
      .filter(value => value && !Number.isNaN(new Date(value).getTime()))
      .sort((a, b) => new Date(a) - new Date(b))[0];

    if (normalizedExpiry && new Date(normalizedExpiry).toISOString().split('T')[0] < today) {
      activeMessages.add(String(`${med.name} has expired on ${normalizedExpiry}. Remove from pharmacy stock immediately.`).toLowerCase());
      return;
    }

    if (qty === 0) {
      activeMessages.add(String(`${med.name} is completely out of stock. Immediate restocking required.`).toLowerCase());
      return;
    }

    if (qty <= threshold) {
      activeMessages.add(String(`${med.name} stock is low (${qty} remaining, minimum ${threshold}).`).toLowerCase());
    }
  });

  const filtered = (Array.isArray(alerts) ? alerts : []).filter((alert) => {
    if (!alert) return false;
    const categoryText = `${alert.category || alert.Alert_Category || ''}`.toLowerCase();
    const alertText = `${alert.title || ''} ${alert.description || ''} ${alert.message || ''}`;
    const isMedicineAlert = categoryText.includes('medicine') || /medicine|stock|inventory|expiry|expired|out of stock|low stock/.test(alertText.toLowerCase());

    if (!isMedicineAlert) return true;
    const exactMessage = String(alert.message || alert.description || '').trim();
    if (!exactMessage) return true;

    const isCurrentCondition = activeMessages.has(exactMessage.toLowerCase());
    const isPastCondition = /out of stock|low stock|expired/i.test(exactMessage) && !isCurrentCondition;
    return !isPastCondition && (isCurrentCondition || exactMessage.length === 0);
  });

  if (filtered.length !== (Array.isArray(alerts) ? alerts : []).length) {
    localStorage.setItem('alerts', JSON.stringify(filtered));
  }

  return filtered;
};

export const runDiseaseForecastingFromPatients = (allPatients = []) => {
  removeDiseaseForecastAlerts();

  // Find all completed/prescribed patients with a diagnosis
  const completedPatients = (Array.isArray(allPatients) ? allPatients : [])
    .filter(p => p && (p.status === 'Prescribed' || p.prescribed === true || p.pendingPrescription === false) && p.disease && String(p.disease).trim() !== '');

  // Demo trigger: requires at least 2 completed real patient records
  if (completedPatients.length < 2) {
    return {
      status: 'waiting',
      completedCount: completedPatients.length,
      requiredCount: 2,
      message: `${completedPatients.length} of 2 required completed patient records.`
    };
  }

  // Group completed patients by disease
  const diseaseGroups = new Map();

  completedPatients.forEach((patient) => {
    const rawDisease = String(patient.disease).trim();
    const key = normalizeDiseaseKey(rawDisease);
    if (!key) return;

    const group = diseaseGroups.get(key) || {
      diseaseName: rawDisease,
      currentCases: 0,
      patients: []
    };

    group.currentCases += 1;
    group.patients.push(patient);
    diseaseGroups.set(key, group);
  });

  const alertsCreated = [];
  const topDiseaseGroups = Array.from(diseaseGroups.values())
    .sort((a, b) => b.currentCases - a.currentCases)
    .slice(0, 2);

  // Evaluate only the top 1-2 active disease groups to avoid alert flooding
  topDiseaseGroups.forEach((group) => {
    const { diseaseName, currentCases } = group;

    const historicalCases = 26;
    const predictedCases = historicalCases + currentCases;
    const riskLevel = predictedCases > 35 ? 'HIGH' : predictedCases >= 25 ? 'MEDIUM' : 'LOW';

    if (riskLevel === 'HIGH' || riskLevel === 'MEDIUM') {
      const alertSeverity = riskLevel === 'HIGH' ? 'Critical' : 'Warning';
      const alertMessage = `${currentCases} patient${currentCases > 1 ? 's' : ''} diagnosed with ${diseaseName}. Current cases: ${currentCases}. Forecast: increasing trend / expected future cases: ${predictedCases}. Risk level: ${riskLevel}.`;

      const newAlert = addAlert(
        alertSeverity,
        alertMessage,
        'doctor',
        'Clinical Disease Alert',
        'disease'
      );

      if (newAlert) {
        alertsCreated.push(newAlert);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('alertsUpdated'));
        }
      }
    }
  });

  return {
    status: 'success',
    completedPatientsCount: completedPatients.length,
    alertsCreated
  };
};

// =========================================================
// STAFF → ADD PATIENT
// Stored in DB; NO alert is generated on patient addition
// =========================================================

export const addPatient = (patientData) => {
  const patients = getPatients();
  
  const nextNum = patients.length > 0 
    ? Math.max(...patients.map(p => parseInt(String(p.id).replace('P', '')) || 1000)) + 1 
    : 1011;
  const newId = patientData.id || `P${nextNum}`;
  
  // Enforce Hospital Staff restriction: staff records demographics and diagnosis.
  // Patient is awaiting prescription. Staff cannot assign medicines.
  const newPatient = normalizePatient({
    ...patientData,
    id: newId,
    medicines: [],
    medicine: 'Not Prescribed Yet',
    medicineQuantity: 0,
    status: 'Awaiting Prescription',
    prescribed: false,
    pendingPrescription: true
  });
  
  patients.push(newPatient);
  savePatients(patients);

  // IMPORTANT: Adding a patient must NEVER create an alert or trigger forecasting.
  // Patient registration is purely stored in DB.
  return newPatient;
};

export const updatePatient = (updatedPatient) => {
  const patients = getPatients();
  const currentUser = getLoggedInUser();
  const index = patients.findIndex(p => p.id === updatedPatient.id);
  
  if (index !== -1) {
    const originalPatient = patients[index];
    
    if (currentUser?.role === 'doctor') {
      const updatedMedicines = Array.isArray(updatedPatient.medicines) 
        ? updatedPatient.medicines 
        : originalPatient.medicines;

      patients[index] = normalizePatient({
        ...originalPatient,
        disease: updatedPatient.disease || originalPatient.disease,
        symptoms: updatedPatient.symptoms !== undefined ? updatedPatient.symptoms : originalPatient.symptoms,
        medicines: updatedMedicines,
        doctor: currentUser.name || originalPatient.doctor,
        status: updatedPatient.status || originalPatient.status
      });
    } else {
      // Hospital staff cannot modify doctor's prescription
      patients[index] = normalizePatient({
        ...originalPatient,
        ...updatedPatient,
        medicines: originalPatient.medicines || [],
        medicine: originalPatient.medicine || 'Not Prescribed Yet',
        medicineQuantity: originalPatient.medicineQuantity || 0,
        status: updatedPatient.status || originalPatient.status || 'Awaiting Prescription',
        pendingPrescription: updatedPatient.pendingPrescription !== undefined ? updatedPatient.pendingPrescription : (originalPatient.pendingPrescription !== false),
        prescribed: updatedPatient.prescribed !== undefined ? updatedPatient.prescribed : (originalPatient.prescribed === true)
      });
    }
    
    savePatients(patients);
    return patients[index];
  }
  return null;
};

export const getDueFollowUpPatients = (allPatients = getPatients()) => {
  const today = new Date().toISOString().split('T')[0];
  return (Array.isArray(allPatients) ? allPatients : [])
    .filter(patient => {
      const normalized = normalizePatient(patient);
      if (!normalized.nextVisit) return false;
      if (normalized.status === 'Prescribed' || normalized.prescribed === true) return false;
      return normalized.nextVisit <= today || normalized.pendingPrescription !== false;
    })
    .map(patient => normalizePatient(patient));
};

export const submitFollowUpPatient = (patientId, followUpDate = new Date().toISOString().split('T')[0]) => {
  const patients = getPatients();
  const index = patients.findIndex(p => p.id === patientId);

  if (index === -1) return null;

  patients[index] = normalizePatient({
    ...patients[index],
    lastVisit: followUpDate,
    nextVisit: followUpDate,
    pendingPrescription: true,
    prescribed: false,
    status: 'Awaiting Prescription'
  });

  savePatients(patients);
  return patients[index];
};

// =========================================================
// DOCTOR → PRESCRIBE MEDICINES
// Prescribing removes patient from pending queue,
// PRESERVES patient in DB/history,
// and triggers disease forecasting when 2 completed patients exist!
// =========================================================

export const prescribeMedicines = (patientId, { medicines = [], disease, symptoms, notes, status }) => {
  const patients = getPatients();
  const currentUser = getLoggedInUser();
  const index = patients.findIndex(p => p.id === patientId);

  if (index === -1) return null;

  const originalPatient = patients[index];

  const updatedMedicines = Array.isArray(medicines) ? medicines : [];
  const medicineSummary = updatedMedicines.length > 0 
    ? updatedMedicines.map(m => m.name).join(', ') 
    : 'Not Prescribed Yet';
  const totalQty = updatedMedicines.reduce((sum, m) => sum + (parseInt(m.quantity) || 0), 0);

  // Update patient record
  patients[index] = {
    ...originalPatient,
    disease: disease || originalPatient.disease,
    symptoms: symptoms !== undefined ? symptoms : originalPatient.symptoms,
    medicines: updatedMedicines,
    medicine: medicineSummary,
    medicineQuantity: totalQty,
    doctor: currentUser?.name || originalPatient.doctor || 'Dr. Sarah Paul',
    clinicalNotes: notes !== undefined ? notes : originalPatient.clinicalNotes,
    status: 'Prescribed',
    prescribed: true,
    pendingPrescription: false,
    lastVisit: new Date().toISOString().split('T')[0],
    prescriptionDate: new Date().toISOString().split('T')[0]
  };

  // CRITICAL REQUIREMENT: Do NOT delete the patient master record!
  // Patient remains in patients database and history.
  savePatients(patients);

  // Deduct inventory stock for prescribed medicines
  try {
    const allMeds = getMedicines();
    let medStockChanged = false;

    updatedMedicines.forEach(prescribedMed => {
      const targetMed = allMeds.find(
        m => m.id === prescribedMed.medicineId || m.name === prescribedMed.name
      );
      if (targetMed) {
        const dispenseQty = parseInt(prescribedMed.quantity) || 1;
        targetMed.quantity = Math.max(0, (parseInt(targetMed.quantity) || 0) - dispenseQty);
        medStockChanged = true;
      }
    });

    if (medStockChanged) {
      saveMedicines(allMeds);
    }
  } catch (err) {
    console.error('Failed to deduct medicine stock on prescription:', err);
  }

  // TRIGGER: Detect required completed real patient records
  // When completed prescribed records >= 2, immediately execute disease analysis & forecasting!
  const forecastResult = runDiseaseForecastingFromPatients(patients);

  return {
    ...patients[index],
    forecastResult
  };
};

// Manual delete for staff (e.g. invalid entry)
export const deletePatient = (patientId) => {
  const patients = getPatients();
  const patient = patients.find(p => p.id === patientId);
  
  if (patient) {
    const updatedPatients = patients.filter(p => p.id !== patientId);
    savePatients(updatedPatients);
    return true;
  }
  return false;
};


// Default descriptions map for known medicines
const DEFAULT_MED_DESCRIPTIONS = {
  "Metformin": "Used to control high blood sugar in patients with type 2 diabetes.",
  "Amlodipine": "Used to treat high blood pressure (hypertension) and prevent chest pain (angina).",
  "Amoxicillin": "Antibiotic used to treat a wide variety of bacterial infections including chest and throat infections.",
  "Salbutamol Inhaler": "Used to quickly relieve breathing difficulties, wheezing, and chest tightness caused by asthma.",
  "Atorvastatin": "Used along with a proper diet to lower 'bad' cholesterol and reduce the risk of heart complications.",
  "Levothyroxine": "Used to treat hypothyroidism (underactive thyroid gland) to restore normal hormone levels.",
  "Chloroquine": "Used to prevent and treat malaria caused by mosquito bites in rural sectors.",
  "Iron Supplements": "Used to treat or prevent low blood levels of iron and manage iron-deficiency anemia.",
  "Rifampicin": "Antibiotic used with other medications to treat tuberculosis (TB) and serious bacterial infections.",
  "Paracetamol": "Used to reduce fever and relieve mild to moderate pain like headaches, body aches, and fever."
};

// --- MEDICINES SERVICES (Pharmacist) ---

export const getMedicines = () => {
  const raw = JSON.parse(localStorage.getItem('medicines') || '[]');
  return raw.map(m => ({
    ...m,
    expiryDate: m.expiryDate || '',
    newStockExpiryDate: m.newStockExpiryDate || m.expiryDate || '',
    minimumStock: parseInt(m.minimumStock) || 50,
    description: m.description || DEFAULT_MED_DESCRIPTIONS[m.name] || `Used for therapeutic management and treatment of ${m.category || 'general conditions'}.`
  }));
};

export const saveMedicines = (medicines) => {
  localStorage.setItem('medicines', JSON.stringify(medicines));
  checkMedicineStockAlerts(medicines);
};

export const addMedicine = (medicineData) => {
  const medicines = getMedicines();
  const newId = medicineData.id || 'M' + String(medicines.length + 2001);
  const expiryDate = medicineData.expiryDate || '';
  
  const newMed = {
    ...medicineData,
    id: newId,
    expiryDate,
    newStockExpiryDate: medicineData.newStockExpiryDate || expiryDate,
    description: medicineData.description || DEFAULT_MED_DESCRIPTIONS[medicineData.name] || `Used for therapeutic management of ${medicineData.category || 'clinical conditions'}.`,
    quantity: parseInt(medicineData.quantity) || 0,
    minimumStock: parseInt(medicineData.minimumStock) || 50
  };
  
  medicines.push(newMed);
  saveMedicines(medicines);
  return newMed;
};

export const updateMedicine = (updatedMed) => {
  const medicines = getMedicines();
  const index = medicines.findIndex(m => m.id === updatedMed.id);
  
  if (index !== -1) {
    medicines[index] = {
      ...medicines[index],
      ...updatedMed,
      expiryDate: updatedMed.expiryDate || medicines[index].expiryDate || '',
      newStockExpiryDate: updatedMed.newStockExpiryDate || medicines[index].newStockExpiryDate || updatedMed.expiryDate || medicines[index].expiryDate || '',
      description: updatedMed.description || medicines[index].description || DEFAULT_MED_DESCRIPTIONS[updatedMed.name] || '',
      quantity: parseInt(updatedMed.quantity) >= 0 ? parseInt(updatedMed.quantity) : 0,
      minimumStock: parseInt(updatedMed.minimumStock) || 50
    };
    saveMedicines(medicines);
    return medicines[index];
  }
  return null;
};

export const dispenseMedicine = (medicineId, quantity, patientName = '') => {
  const qtyToDeduct = parseInt(quantity);
  if (isNaN(qtyToDeduct) || qtyToDeduct <= 0) {
    throw new Error('Please enter a valid quantity greater than 0.');
  }

  const medicines = getMedicines();
  const index = medicines.findIndex(m => m.id === medicineId);

  if (index === -1) {
    throw new Error('Medicine not found in inventory.');
  }

  const med = medicines[index];
  const currentQty = parseInt(med.quantity) || 0;

  if (qtyToDeduct > currentQty) {
    throw new Error(`Insufficient stock available. Only ${currentQty} units currently in stock.`);
  }

  const newQty = currentQty - qtyToDeduct;
  medicines[index] = {
    ...med,
    quantity: newQty
  };

  saveMedicines(medicines);

  // NOTE: Dispensing is normal pharmacy activity and must NOT generate an alert.
  // Medicine alerts are only generated for Low Stock, Out of Stock, or Expired Medicine.
  return medicines[index];
};


// --- ALERTS SERVICES ---

export const isMeaningfulAlertMessage = (message = '') => {
  const text = String(message).toLowerCase();
  const blockedPatterns = [
    'prescription saved',
    'prescription added',
    'prescription updated',
    'patient added',
    'patient updated',
    'patient record',
    'registered by',
    'new patient',
    'new admission',
    'patient registered',
    'patient joined',
    'added by',
    'updated their profile',
    'successfully',
    'saved successfully',
    'added to inventory',
    'medicine added',
    'updated by',
    'dispensed',
    'recorded in system',
    'profile updated',
    'login',
    'logged in'
  ];

  return !blockedPatterns.some(pattern => text.includes(pattern));
};

export const shouldIncludeAlert = (alert) => {
  if (!alert) return false;
  const text = `${alert.title || ''} ${alert.description || ''} ${alert.message || ''}`.toLowerCase();
  const category = (alert.category || alert.Alert_Category || '').toString().toLowerCase();

  const isMedicineAlert = category.includes('medicine') || /medicine|stock|inventory|expiry|expired|out of stock|low stock/.test(text);
  const isDiseaseAlert = category.includes('disease') || /disease|outbreak|risk|forecast|epidemic|diagnosed with|clinical disease alert/.test(text);
  const isBlocked = !isMeaningfulAlertMessage(text) || /prescription saved|prescription added|patient registered|registered by|new patient|saved successfully|updated their profile|dispensed/i.test(text);

  if (isBlocked) return false;
  return isMedicineAlert || isDiseaseAlert;
};

// Marks alert notifications as seen for the notification bell
// CRITICAL: Does NOT delete the alert from the Alert Page!
export const markAlertsAsSeen = (alertIds = []) => {
  const alerts = JSON.parse(localStorage.getItem('alerts') || '[]');
  const ids = (Array.isArray(alertIds) ? alertIds : [alertIds]).map(String);

  const updated = (Array.isArray(alerts) ? alerts : []).map(alert => {
    if (ids.includes(String(alert.id))) {
      return {
        ...alert,
        seen: true,
        read: true,
        notificationRead: true,
        status: 'Read'
      };
    }
    return alert;
  });

  localStorage.setItem('alerts', JSON.stringify(updated));
  return updated;
};

export const pruneExpiredAlerts = (days = 30) => {
  const raw = JSON.parse(localStorage.getItem('alerts') || '[]');
  const list = Array.isArray(raw) ? raw : [];
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const filtered = list.filter((alert) => {
    if (!alert) return false;
    const value = alert.date || alert.Alert_Date || alert.created_at || alert.Created_At || alert.timestamp || alert.Timestamp;
    if (!value) return true;
    const alertDate = new Date(String(value).replace(' ', 'T')).getTime();
    return !Number.isNaN(alertDate) ? alertDate >= cutoff : true;
  });

  if (filtered.length !== list.length) {
    localStorage.setItem('alerts', JSON.stringify(filtered));
  }

  return filtered;
};

export const getAlerts = () => {
  const raw = JSON.parse(localStorage.getItem('alerts') || '[]');
  const list = Array.isArray(raw) ? raw : [];

  return list
    .filter(alert => alert && shouldIncludeAlert(alert))
    .map(a => ({
      ...a,
      title: a.title || 'Alert',
      description: a.description || a.message || 'Alert',
      message: a.message || a.description || 'Alert',
      category: a.category || 'medicine',
      severity: a.severity || a.type || 'Warning',
      type: a.type || a.severity || 'Warning'
    }));
};

export const addAlert = (type, message, role = 'doctor', title = '', category = '') => {
  if (!message || !isMeaningfulAlertMessage(message)) {
    return null;
  }

  const isMed = category === 'medicine' || /medicine|stock|inventory|expiry|expired|out of stock|low stock/i.test(message);
  const isDisease = category === 'disease' || /disease|outbreak|risk|forecast|epidemic|diagnosed with|clinical disease alert/.test(message);

  if (!isMed && !isDisease) {
    return null;
  }

  const alerts = JSON.parse(localStorage.getItem('alerts') || '[]');
  const finalTitle = title || (isMed ? 'Medicine Stock Alert' : 'Clinical Disease Alert');
  const duplicateKey = `${finalTitle.trim()}::${String(message).trim()}`;

  if (alerts.some(alert => `${alert.title || ''}::${alert.message || alert.description || ''}` === duplicateKey)) {
    return null;
  }

  const newAlert = {
    id: 'A' + Date.now() + Math.floor(Math.random() * 100),
    title: finalTitle,
    description: message,
    message,
    category: category || (isMed ? 'medicine' : 'disease'),
    type: type || 'Warning',
    severity: type || 'Warning',
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    role,
    read: false,
    seen: false,
    notificationRead: false,
    status: 'Active'
  };

  alerts.unshift(newAlert);
  localStorage.setItem('alerts', JSON.stringify(alerts));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('alertsUpdated'));
  }

  return newAlert;
};

// Automatic alert generation for medicine stock & expiry checking
export const checkMedicineStockAlerts = (medicines) => {
  const activeMedicines = Array.isArray(medicines) ? medicines : getMedicines();
  const storedAlerts = JSON.parse(localStorage.getItem('alerts') || '[]');
  const currentAlerts = Array.isArray(storedAlerts) ? storedAlerts : [];
  const nonMedicineAlerts = currentAlerts.filter(alert => {
    if (!alert) return false;
    const text = `${alert.title || ''} ${alert.description || ''} ${alert.message || ''}`.toLowerCase();
    return !/expired|out of stock|low stock|stock is low|medicine/i.test(text);
  });

  const medicineAlerts = new Map();
  const today = new Date().toISOString().split('T')[0];

  activeMedicines.forEach((med) => {
    const qty = parseInt(med.quantity) || 0;
    const threshold = parseInt(med.minimumStock) || 50;
    const expiryValues = [med.expiryDate, med.newStockExpiryDate, med.expiry].filter(Boolean);
    const expiry = expiryValues.length > 0
      ? expiryValues.map(v => String(v).trim()).filter(Boolean).sort((a, b) => new Date(a) - new Date(b))[0]
      : null;
    const normalizedExpiry = expiry && !Number.isNaN(new Date(expiry).getTime()) ? expiry : null;

    let severity = 'Info';
    let message = '';
    let title = '';

    if (normalizedExpiry && new Date(normalizedExpiry).toISOString().split('T')[0] < today) {
      severity = 'Critical';
      title = 'Medicine Expiry Alert';
      message = `${med.name} has expired on ${normalizedExpiry}. Remove from pharmacy stock immediately.`;
    } else if (qty === 0) {
      severity = 'Critical';
      title = 'Medicine Out of Stock';
      message = `${med.name} is completely out of stock. Immediate restocking required.`;
    } else if (qty <= threshold) {
      severity = 'Warning';
      title = 'Medicine Low Stock Warning';
      message = `${med.name} stock is low (${qty} remaining, minimum ${threshold}).`;
    }

    if (message) {
      medicineAlerts.set(med.name, {
        id: `A${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        type: severity,
        severity,
        message,
        description: message,
        category: 'medicine',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        role: 'pharmacist',
        status: 'Active',
        seen: false
      });
    }
  });

  const finalAlerts = [...nonMedicineAlerts, ...Array.from(medicineAlerts.values())];
  localStorage.setItem('alerts', JSON.stringify(finalAlerts));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('alertsUpdated'));
  }

  return finalAlerts;
};
