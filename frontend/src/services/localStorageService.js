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
    // Ensure only the two predefined admin accounts exist in local storage users
    try {
      let existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      // Remove any legacy admin accounts (e.g. admin@example.com)
      existingUsers = existingUsers.filter(u => u.email !== 'admin@example.com');
      
      // Ensure admin1 and admin2 exist with exact credentials
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
    localStorage.setItem('alerts', JSON.stringify(mockAlerts));
  }
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

  // 1. Check if the login attempt is for a predefined Admin account
  const matchingAdmin = PREDEFINED_ADMINS.find(a => a.email.toLowerCase() === cleanEmail);
  if (matchingAdmin) {
    if (matchingAdmin.password === cleanPassword) {
      setLoggedInUser(matchingAdmin);
      return matchingAdmin;
    }
    // Invalid password for admin
    return null;
  }

  // 2. Otherwise, authenticate standard non-admin users (Doctor, Hospital Staff, Pharmacist)
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword);
  
  if (user) {
    // Only allow non-admin roles through standard user lookup
    if (user.role === 'admin') {
      return null;
    }
    setLoggedInUser(user);
    return user;
  }
  return null;
};

export const signup = (userData) => {
  // Reject any attempt to register an Admin account
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
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
};

export const updateUserProfile = (updatedData) => {
  const currentUser = getLoggedInUser();
  if (!currentUser) return null;
  
  const users = getUsers();
  const index = users.findIndex(u => u.id === currentUser.id);
  
  if (index !== -1) {
    const updatedUser = { ...users[index], ...updatedData };
    users[index] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
    setLoggedInUser(updatedUser);
    
    // Log profile update alert
    addAlert(
      'Info',
      `User ${updatedUser.name} (${updatedUser.role}) updated their profile details.`,
      updatedUser.role === 'doctor' ? 'doctor' : updatedUser.role === 'hospitalStaff' ? 'hospitalStaff' : updatedUser.role === 'pharmacist' ? 'pharmacist' : 'admin'
    );
    
    return updatedUser;
  }
  return null;
};


// Helper to normalize patient records so medicines array is always valid
export const normalizePatient = (patient) => {
  let medicines = Array.isArray(patient.medicines) ? patient.medicines : [];
  
  // If legacy single medicine exists but medicines array is empty, convert it
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

  return {
    ...patient,
    medicines,
    medicine: medicineSummary,
    medicineQuantity: totalQuantity
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

export const addPatient = (patientData) => {
  const patients = getPatients();
  const currentUser = getLoggedInUser();
  
  const newId = patientData.id || 'P' + String(patients.length + 1001);
  
  // Enforce Hospital Staff restriction: staff cannot prescribe/add medicines
  const newPatient = normalizePatient({
    ...patientData,
    id: newId,
    medicines: [], // Staff cannot assign medicines
    medicine: 'Not Prescribed Yet',
    medicineQuantity: 0
  });
  
  patients.push(newPatient);
  savePatients(patients);
  
  // Add Alert
  addAlert(
    'Info',
    `New patient ${newPatient.name} (${newPatient.id}) registered by ${currentUser?.name || 'Hospital Staff'}.`,
    'hospitalStaff'
  );
  
  return newPatient;
};

export const updatePatient = (updatedPatient) => {
  const patients = getPatients();
  const currentUser = getLoggedInUser();
  const index = patients.findIndex(p => p.id === updatedPatient.id);
  
  if (index !== -1) {
    const originalPatient = patients[index];
    
    if (currentUser?.role === 'doctor') {
      // Doctor updates disease, multiple medicines, and optionally status
      const updatedMedicines = Array.isArray(updatedPatient.medicines) 
        ? updatedPatient.medicines 
        : originalPatient.medicines;

      patients[index] = normalizePatient({
        ...originalPatient,
        disease: updatedPatient.disease || originalPatient.disease,
        medicines: updatedMedicines,
        doctor: currentUser.name || originalPatient.doctor,
        status: updatedPatient.status || originalPatient.status
      });

      const medSummary = patients[index].medicine;

      addAlert(
        'Info',
        `Patient ${originalPatient.name} prescription updated by ${currentUser.name}: ${medSummary}.`,
        'hospitalStaff'
      );
      addAlert(
        'Info',
        `Prescription updated for ${originalPatient.name} (${updatedMedicines.length} medication${updatedMedicines.length === 1 ? '' : 's'}).`,
        'doctor'
      );
    } else {
      // Hospital staff CANNOT modify medicines - preserve doctor's prescription!
      patients[index] = normalizePatient({
        ...updatedPatient,
        medicines: originalPatient.medicines || [], // Preserve existing doctor medicines
        medicine: originalPatient.medicine || 'Not Prescribed Yet',
        medicineQuantity: originalPatient.medicineQuantity || 0
      });
      
      addAlert(
        'Info',
        `Patient record ${originalPatient.name} updated by Staff ${currentUser?.name || ''}.`,
        'hospitalStaff'
      );
    }
    
    // If the patient status is set to Critical, create critical alert
    if (updatedPatient.status === 'Critical' && originalPatient.status !== 'Critical') {
      addAlert(
        'Critical',
        `Critical status flagged for patient ${updatedPatient.name} (${updatedPatient.id}) - ${updatedPatient.disease}`,
        'doctor'
      );
      addAlert(
        'Critical',
        `Critical status flagged for patient ${updatedPatient.name} (${updatedPatient.id})`,
        'hospitalStaff'
      );
    }
    
    savePatients(patients);
    return patients[index];
  }
  return null;
};

// Dedicated Doctor Multi-Medicine Prescription Service
export const prescribeMedicines = (patientId, { medicines = [], disease, notes, status }) => {
  const patients = getPatients();
  const currentUser = getLoggedInUser();
  const index = patients.findIndex(p => p.id === patientId);

  if (index === -1) return null;

  const originalPatient = patients[index];

  const updatedPatient = normalizePatient({
    ...originalPatient,
    disease: disease || originalPatient.disease,
    medicines: medicines,
    doctor: currentUser?.name || originalPatient.doctor,
    clinicalNotes: notes !== undefined ? notes : originalPatient.clinicalNotes,
    status: status || originalPatient.status,
    lastVisit: new Date().toISOString().split('T')[0]
  });

  patients[index] = updatedPatient;
  savePatients(patients);

  addAlert(
    'Info',
    `Dr. ${currentUser?.name || 'Physician'} prescribed ${medicines.length} medicine(s) for ${updatedPatient.name}.`,
    'hospitalStaff'
  );
  addAlert(
    'Info',
    `Prescription saved for ${updatedPatient.name} (${updatedPatient.id}).`,
    'doctor'
  );

  return updatedPatient;
};

export const deletePatient = (patientId) => {
  const patients = getPatients();
  const currentUser = getLoggedInUser();
  const patient = patients.find(p => p.id === patientId);
  
  if (patient) {
    const updatedPatients = patients.filter(p => p.id !== patientId);
    savePatients(updatedPatients);
    
    addAlert(
      'Warning',
      `Patient record ${patient.name} (${patient.id}) deleted by Staff ${currentUser?.name || ''}.`,
      'hospitalStaff'
    );
    return true;
  }
  return false;
};


// --- MEDICINES SERVICES (Pharmacist) ---

export const getMedicines = () => {
  return JSON.parse(localStorage.getItem('medicines') || '[]');
};

export const saveMedicines = (medicines) => {
  localStorage.setItem('medicines', JSON.stringify(medicines));
  checkMedicineStockAlerts(medicines);
};

export const addMedicine = (medicineData) => {
  const medicines = getMedicines();
  const newId = medicineData.id || 'M' + String(medicines.length + 2001);
  
  const newMed = {
    ...medicineData,
    id: newId,
    quantity: parseInt(medicineData.quantity) || 0,
    minimumStock: parseInt(medicineData.minimumStock) || 0
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
      ...updatedMed,
      quantity: parseInt(updatedMed.quantity) || 0,
      minimumStock: parseInt(updatedMed.minimumStock) || 0
    };
    saveMedicines(medicines);
    return medicines[index];
  }
  return null;
};


// --- ALERTS SERVICES ---

export const getAlerts = () => {
  return JSON.parse(localStorage.getItem('alerts') || '[]');
};

export const addAlert = (type, message, role = 'hospitalStaff') => {
  const alerts = getAlerts();
  const newAlert = {
    id: 'A' + Date.now() + Math.floor(Math.random() * 100),
    type,
    message,
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    role
  };
  
  alerts.unshift(newAlert);
  localStorage.setItem('alerts', JSON.stringify(alerts));
  return newAlert;
};

// Automatic alert generation for stock checking
export const checkMedicineStockAlerts = (medicines) => {
  const alerts = getAlerts();
  let updatedAlerts = [...alerts];
  let changed = false;
  
  medicines.forEach(med => {
    const qty = parseInt(med.quantity);
    const min = parseInt(med.minimumStock);
    
    if (qty === 0) {
      const msg = `${med.name} is completely out of stock.`;
      if (!updatedAlerts.some(a => a.message === msg)) {
        updatedAlerts.unshift({
          id: 'A' + Date.now() + Math.floor(Math.random() * 1000),
          type: 'Critical',
          message: msg,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          role: 'pharmacist'
        });
        changed = true;
      }
    } else if (qty <= min) {
      const msg = `${med.name} stock is low (${qty} remaining, minimum ${min}).`;
      if (!updatedAlerts.some(a => a.message === msg)) {
        updatedAlerts.unshift({
          id: 'A' + Date.now() + Math.floor(Math.random() * 1000),
          type: 'Warning',
          message: msg,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          role: 'pharmacist'
        });
        changed = true;
      }
    }
  });
  
  if (changed) {
    localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
  }
};
