import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ApplicationForm from './pages/ApplicationForm';
import Login from './pages/Login';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  console.log('ProtectedRoute - Token:', token ? 'exists' : 'missing');
  console.log('ProtectedRoute - User role:', user.role);
  console.log('ProtectedRoute - Allowed role:', allowedRole);

  if (!token) {
    console.log('No token, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    console.log('Role mismatch, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('Access granted');
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ApplicationForm />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/recruiter" 
          element={
            <ProtectedRoute allowedRole="recruiter">
              <RecruiterDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
