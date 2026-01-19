
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Households from './pages/Households';
import Users from './pages/Users';
import AdminLayout from './components/AdminLayout';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) return <div className="p-10">Loading...</div>;
  if (!admin) return <Navigate to="/login" />;

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="households" element={<Households />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<div className="p-8">Settings Page (Coming Soon)</div>} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
