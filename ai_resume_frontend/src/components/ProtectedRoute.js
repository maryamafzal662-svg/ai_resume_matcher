import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Token nahi mila toh login page pe redirect karo
    return <Navigate to="/login" replace />;
  }

  // Token mila toh component show karo
  return children;
};

export default ProtectedRoute;
