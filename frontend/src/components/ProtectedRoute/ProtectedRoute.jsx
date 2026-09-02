import React from 'react';
import { Navigate } from 'react-router-dom';
import { getLoggedInUser } from '../../services/localStorageService';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getLoggedInUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboards if they attempt to access unauthorized paths
    if (user.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (user.role === 'hospitalStaff') {
      return <Navigate to="/hospital/dashboard" replace />;
    } else if (user.role === 'pharmacist') {
      return <Navigate to="/pharmacist/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // General fallback
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
