import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeData } from './services/localStorageService';

// Import Global Stylesheet (which loads variable tokens)
import './styles/global.css';

// Public Pages
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';

// Protected Route Guard
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAlerts from './pages/doctor/DoctorAlerts';

// Hospital Staff Pages
import HospitalDashboard from './pages/hospitalStaff/HospitalDashboard';
import PatientManagement from './pages/hospitalStaff/PatientManagement';
import HospitalAlerts from './pages/hospitalStaff/HospitalAlerts';

// Pharmacist Pages
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard';
import MedicineStock from './pages/pharmacist/MedicineStock';
import PharmacistAlerts from './pages/pharmacist/PharmacistAlerts';

// Shared Pages
import Profile from './pages/Profile';

function App() {
  // Initialize mock data in local storage
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Doctor Workspace Protected Routes */}
        <Route 
          path="/doctor/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor/patients" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorPatients />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor/alerts" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorAlerts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor/profile" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Hospital Staff Workspace Protected Routes */}
        <Route 
          path="/hospital/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['hospitalStaff']}>
              <HospitalDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hospital/patients" 
          element={
            <ProtectedRoute allowedRoles={['hospitalStaff']}>
              <PatientManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hospital/alerts" 
          element={
            <ProtectedRoute allowedRoles={['hospitalStaff']}>
              <HospitalAlerts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hospital/profile" 
          element={
            <ProtectedRoute allowedRoles={['hospitalStaff']}>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Pharmacist Workspace Protected Routes */}
        <Route 
          path="/pharmacist/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['pharmacist']}>
              <PharmacistDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pharmacist/medicines" 
          element={
            <ProtectedRoute allowedRoles={['pharmacist']}>
              <MedicineStock />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pharmacist/alerts" 
          element={
            <ProtectedRoute allowedRoles={['pharmacist']}>
              <PharmacistAlerts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pharmacist/profile" 
          element={
            <ProtectedRoute allowedRoles={['pharmacist']}>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
