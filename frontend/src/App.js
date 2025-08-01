// src/App.js
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import the new pages
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';

// Import your new dashboard component
import MedicalDashboard from './components/MedicalDashboard';

// A component to protect routes
const ProtectedRoute = () => {
  const token = localStorage.getItem('userToken');
  // Outlet renders the child route if the token exists
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Protected Routes (only accessible to logged-in users) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<MedicalDashboard />} />
        {/* You can add more protected routes here, e.g., for reporting */}
      </Route>

      {/* Catch-all route to redirect to the dashboard if a token exists, otherwise to login */}
      <Route
        path="*"
        element={
          localStorage.getItem('userToken') ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default App;