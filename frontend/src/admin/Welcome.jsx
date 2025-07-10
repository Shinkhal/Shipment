// src/pages/admin/AdminWelcome.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminWelcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-white px-4">
      <h1 className="text-4xl font-bold text-purple-700 mb-4">Welcome to Admin Panel</h1>
      <p className="text-gray-600 text-center max-w-md mb-6">
        Manage users, shipments, and analytics in one place. Please log in to access your dashboard.
      </p>
      <button
        onClick={() => navigate('/admin/login')}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
      >
        Go to Login
      </button>
    </div>
  );
};

export default AdminWelcome;
